from qdrant_client import QdrantClient, models
from qdrant_client.models import Distance, VectorParams, PointStruct, HnswConfigDiff
from tqdm import tqdm
import os
import numpy as np
import ujson
import glob
import pickle
import time

from typing import List, Optional, Any
from collections import defaultdict
import bisect

from pathlib import Path
import sys

current_path = Path(__file__).resolve()
for parent in current_path.parents:
    # Project root is detected by content (it holds configs/ and utils/)
    # rather than by folder name, so the tree can be checked out under any
    # directory name - e.g. SIU_Pumpking_local on a client machine.
    if (parent / "configs").is_dir() and (parent / "utils").is_dir():
        sys.path.append(str(parent))
        break
else:
    raise RuntimeError("Could not find the SIU_Pumpking project root (a parent directory containing configs/ and utils/).")

#from utils.metadata_util import get_batch#, get_videos_from_batch
from utils.vector_database_util import merge_scores, merge_scores_reverse, preprocess_object_dict

from utils.logger import get_logger

logger = get_logger()

class QDRANT:
    def __init__(self, QDRANT__URL: str = "http://0.0.0.0", 
                 QDRANT_PORT: int = 7333, 
                 QDRANT_GRPC_PORT: int = 7334, 
                 collection_name: str = None,
                 timeout: int = 1800,
                 search_timeout: int = 60):
        # Two separate budgets on purpose:
        #   timeout        - client-wide, covers bulk indexing. addDatabase()
        #                    upserts hundreds of thousands of points and can
        #                    legitimately run for many minutes.
        #   search_timeout - query_points only. A search that has not returned
        #                    within a minute is a fault, not slow progress.
        # These were previously the same 1800s value, so when searches were slow
        # the service sat silent for 30 minutes instead of raising - which is
        # exactly what made a storage problem look like "qdrant not responding".
        self.timeout = timeout
        self.search_timeout = search_timeout
        self.collection_name = collection_name

        self.client = QdrantClient(
            url=f"{QDRANT__URL}:{QDRANT_PORT}",
            grpc_port=QDRANT_GRPC_PORT,
            prefer_grpc=True,
            timeout=self.timeout
        )

        # These three walk the keyframe tree and open ~3000 small JSON files on
        # /mnt/e - a USB HDD reached over 9p, where every stat/open is a round
        # trip. Measured cost: ~10 minutes of pure I/O wait on every startup,
        # with the process sitting in D state on p9_client_rpc. The dataset is
        # static between runs, so the results are memoised to local disk.
        self.frame_names = self._cached("frame_names", self._prepare_data)
        self.img_dups = self._cached("img_dups", self._prepare_dup)
        self.img_uniques = self._cached("img_uniques", self._prepare_unique)
        logger.info(f"QDRANT Connection Success with QDRANT_PORT: {QDRANT_PORT}")

    def _prep_signature(self):
        """Cheap fingerprint of the inputs the _prepare_* helpers read.

        Three directory listings, versus the ~3000 file opens the helpers
        themselves do - cheap enough to run every startup, and it catches the
        realistic change (videos added or removed).
        """
        try:
            return (
                len(os.listdir("/mnt/e/random42/data/aic_2025/utils/duplicate1")),
                len(os.listdir("/mnt/e/random42/data/aic_2025/utils/unique1")),
                len(glob.glob("/mnt/e/random42/data/aic_2025/*/frames/low_res_autoshot/Keyframes_*")),
            )
        except OSError as e:
            logger.warning(f"prep signature unavailable ({e}); cache disabled this run")
            return None

    def _cached(self, name, builder):
        """Memoise a _prepare_* result on fast local storage.

        Invalidates automatically when _prep_signature() changes. To force a
        rebuild by hand, set QDRANT_PREP_CACHE_REBUILD=1 or delete the cache
        directory (QDRANT_PREP_CACHE, default /mnt/wsl/wsldata/cache).
        """
        base = os.getenv("QDRANT_PREP_CACHE",
                         os.path.expanduser("~/.cache/siu_pumpking/qdrant_prep"))
        sig = self._prep_signature()
        force = os.getenv("QDRANT_PREP_CACHE_REBUILD", "").lower() in ("1", "true", "yes")

        path = os.path.join(base, f"{name}.pkl")
        if sig is not None and not force and os.path.isfile(path):
            try:
                with open(path, "rb") as f:
                    blob = pickle.load(f)
                if blob.get("sig") == sig:
                    logger.info(f"{name}: loaded from cache")
                    return blob["data"]
                logger.info(f"{name}: dataset changed, rebuilding cache")
            except Exception as e:
                logger.warning(f"{name}: cache unreadable ({e}), rebuilding")

        t0 = time.time()
        data = builder()
        logger.info(f"{name}: built in {time.time() - t0:.0f}s")

        if sig is not None:
            try:
                os.makedirs(base, exist_ok=True)
                tmp = path + ".tmp"
                with open(tmp, "wb") as f:
                    pickle.dump({"sig": sig, "data": data}, f, protocol=pickle.HIGHEST_PROTOCOL)
                os.replace(tmp, path)  # atomic, so a crash mid-write cannot leave a torn cache
                logger.info(f"{name}: cached to {path}")
            except OSError as e:
                logger.warning(f"{name}: could not write cache ({e})")
        return data

    def addDatabase(self, collection_name: str, 
                    feature_size: int, 
                    KEYFRAME_FOLDER_PATH: str, 
                    FEATURES_PATH: List[str], 
                    SPLIT_NAME: str, 
                    S2T_PATH: List[str], 
                    OBJECT_PATH: str, 
                    FPS_PATH: List[str],
                    SHOT_PATH: List[str],
                    create_collection: bool = True):

        self.collection_name = collection_name
        self.size = feature_size

        if create_collection:
            
            if self.client.collection_exists(collection_name=collection_name):
                logger.warning("Collection existed, deleting...")
                self.client.delete_collection(collection_name=self.collection_name)
            
            logger.info(f"Creating collection {collection_name}...")
            self.client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=feature_size,
                    distance=Distance.COSINE,
                    quantization_config=models.BinaryQuantization(
                        binary=models.BinaryQuantizationConfig(always_ram=True),
                    )
                ),
                # shard_number was 90 and default_segment_number 16, i.e. up to
                # 1440 segments on a SINGLE node - and the live collection did
                # sit at 1435. Consequences measured on 2026-08-16:
                #   * vectors occupied 46.8GB on disk vs ~5.4GB of real data
                #     (872631 x 1536 x 4B), so the working set could not fit in
                #     page cache and cold queries cost 13-60s
                #   * every restart spent ~15 min recovering shards serially
                #   * each search fanned out across all 90 shards
                # 90 shards is a multi-node cluster setting; this is one node.
                # 4 shards x 4 segments = 16 parallel units, matching the 16
                # cores available, while keeping segments large enough to be
                # cache-friendly. Raise these only if moving to a real cluster.
                optimizers_config=models.OptimizersConfigDiff(default_segment_number=4, max_segment_size=20000000, indexing_threshold=1000),
                on_disk_payload=True,
                shard_number=4,
                hnsw_config=HnswConfigDiff(
                    m=16,                         
                    ef_construct=100,          
                    full_scan_threshold=10000,
                    on_disk=False,                
                )# https://medium.com/@benitomartin/balancing-accuracy-and-speed-with-qdrant-hyperparameters-hydrid-search-and-semantic-caching-part-84b26037e594
                #optimizers_config=models.OptimizersConfigDiff(default_segment_number=64)
            )
            logger.info(f"Collection {collection_name} Created!")
        else:
            logger.info("Collection creation skipped!")


        dict_fps = {}
        for dict_fps_path in FPS_PATH:
            with open(dict_fps_path, encoding='utf-8-sig') as json_file:
                dict_fps_append = ujson.load(json_file)
            dict_fps = dict_fps | dict_fps_append
        logger.info("FPS Dict Loaded")
        
        dict_s2t = {}
        for dict_s2t_path in S2T_PATH:
            with open(dict_s2t_path, encoding='utf-8-sig') as json_file:
                dict_s2t_append = ujson.load(json_file)
            dict_s2t = dict_s2t | dict_s2t_append
        logger.info("STT Dict Loaded")        
        
        dict_unique = {}
        with open("/mnt/e/random42/data/aic_2025/utils/check_unique.json", encoding='utf-8-sig') as json_file:
            dict_unique = ujson.load(json_file)
        logger.info("UNIQUE Dict Loaded")   
        
        dict_shot = {}
        for dict_shot_path in SHOT_PATH:
            with open(dict_shot_path, encoding='utf-8-sig') as json_file:
                dict_shot_append = ujson.load(json_file)
            dict_shot = dict_shot | dict_shot_append
        logger.info("SHOT Dict Loaded")
        
        logger.info("Building payload...")
        
        struct_id = 0
        
        
        for idx_folder, folder_path in enumerate(FEATURES_PATH):
            insert_points = []
            batch_size = 100000  # adjust based on available RAM

            for feat_npy in tqdm(sorted(os.listdir(folder_path))):
                video_name = feat_npy.split('.')[0]
                npy_path = os.path.join(folder_path, feat_npy)

                feats_arr = np.load(npy_path, mmap_mode='r')
                vectors = feats_arr.astype('float32').reshape(-1, feats_arr.shape[-1])

                frame_path = os.path.join(
                    KEYFRAME_FOLDER_PATH,
                    str(idx_folder),
                    "frames",
                    SPLIT_NAME,
                    f"Keyframes_{video_name.split('_')[0]}",
                    "keyframes",
                    video_name
                )
                frame_list = sorted(os.listdir(frame_path))
                frame_list = [f.replace(".avif", ".jpg") for f in frame_list]
                frame_nums = [int(fn.replace(".jpg", "").replace(".avif", "")) for fn in frame_list]

                fps = dict_fps[video_name]
                s2t_map = dict_s2t[video_name + ".mp4"] if (video_name + ".mp4") in dict_s2t else []
                unique = dict_unique[video_name]
                # s2t_map = ""
                # get_objs = dict_obj.get
                shot = dict_shot[video_name]
                base_id = struct_id
                for idx, (vec, frm) in enumerate(zip(vectors, frame_nums)):
                    insert_points.append(
                        PointStruct(
                            id=base_id + idx,
                            vector=vec,
                            payload={
                                "idx_folder": idx_folder,
                                "video_name": video_name + ".mp4",
                                "frame_name": frm,
                                "fps": fps,
                                "s2t": s2t_map[frame_list[idx]],
                                "is_unique": not unique[str(frm)],
                                "object": [],
                                "frame_class": shot[frame_list[idx]][0] if shot != "" else 2,
                                "related_start_frame": shot[frame_list[idx]][1] if shot != "" else 0,
                                "related_end_frame": shot[frame_list[idx]][2] if shot != "" else 50000,
                            },
                        )
                    )

                    # ---- NEW: flush every batch_size points ----
                    if len(insert_points) >= batch_size:
                        phase = (struct_id // batch_size) + 1
                        logger.info(f"Upserting data batch {phase} (size={len(insert_points)})")
                        self.client.upsert(
                            collection_name=self.collection_name,
                            wait=False,
                            points=insert_points,
                        )
                        insert_points = []

                struct_id += len(vectors)

            # flush any remaining points in this folder
            if insert_points:
                logger.info(f"Upserting final batch for folder {idx_folder+1}")
                self.client.upsert(
                    collection_name=self.collection_name,
                    wait=False,
                    points=insert_points,
                )

            logger.info(f"Dataset Insert Completed {str(int(idx_folder)+1)}/{len(FEATURES_PATH)}")
        
        logger.info("Cleaning up dictionary")
        
        logger.info("Creating index...")
        
        self.client.create_payload_index(
            collection_name=self.collection_name,
            field_name="video_name",
            field_schema=models.TextIndexParams(
                tokenizer=models.TokenizerType.PREFIX,
                type="text",
                on_disk=True,
            ),
        )
        
        self.client.create_payload_index(
            collection_name=self.collection_name,
            field_name="s2t",
            field_schema=models.TextIndexParams(
                type="text",
                tokenizer=models.TokenizerType.WORD,
                min_token_len=2,    
                max_token_len=15,
                lowercase=True,
            ),
        )
        
        self.client.create_payload_index(
            collection_name=self.collection_name,
            field_name="frame_class",
            field_schema=models.IntegerIndexParams(
                type=models.IntegerIndexType.INTEGER,
                on_disk=True,
                lookup=True,
                range=False,
            ),
        )
        logger.info("Create payload index complete")
        
        return True

    def scroll_video(self, k, 
                     video_filter: str, 
                     time_in: str = None, 
                     time_out: str = None, 
                     s2t_filter: str = None,
                     feature: str = "shot",
                     frame_class_filter: list = [],
                     skip_frames: list = [],
                     return_s2t: bool = True, # True mặc định là return bth, False là ko return field "s2t" trong cái result ở dưới
                     return_object: bool = True):
        if feature=="shot":
            id_list = sorted(self._get_frames(video_filter, time_in, time_out))
        elif feature=="dup":
            id_list = self.img_dups[video_filter][time_in.lstrip('0')]
        elif feature=="unique":
            id_list = self.img_uniques[video_filter][time_in.lstrip('0')]
        
        SCROLL_RESULT = self.client.retrieve(
            collection_name=self.collection_name,
            ids=id_list,
            with_payload=True,
            with_vectors=False,
        )
        return_result = self._format_search_results(SCROLL_RESULT, use_query=False, return_s2t=return_s2t, return_object=return_object)
    
        logger.info("Processed retrieval")
        return return_result

    def search(self, 
               query: List[float], # feature : float32
               k: int = 100, 
               video_filter: str = "", 
               s2t_filter: str = None,
            #    frame_class_filter: bool = True,
               frame_class_filter: list = [],
               skip_frames: list = [],
               sort_to_news: bool = True,
               return_s2t: bool = True,
               return_object: bool = True):

        must_field = []
        
        if video_filter not in ("", None, []):
            video_filter = video_filter.split(",")
            should_field = []
            for frame_name in video_filter:
                should_field.append(
                    models.FieldCondition(
                        key="video_name",
                        match=models.MatchText(text=frame_name),
                    ),
                )
            must_field.append(models.Filter(should=should_field))
                
        if s2t_filter not in (None,""):
            must_field.append(
                models.FieldCondition(
                    key="s2t",
                    match=models.MatchText(text=s2t_filter),
                )
            )
        
        mustnot_field = []
        if frame_class_filter:
            must_field.append(
                models.FieldCondition(
                    key="frame_class",
                    match=models.MatchAny(any=frame_class_filter),
                ),
            )
        idCondition = set()
        for frame in skip_frames:
            video_name = frame["video_name"]
            frame_name = frame["frame_name"]
            related_start_frame = frame["related_start_frame"]
            related_end_frame = frame["related_end_frame"]
            
            idCondition |= set(self._get_frames(video_name, related_start_frame, related_end_frame))
        mustnot_field.append(models.HasIdCondition(has_id=list(idCondition)))
        FILTER_RESULTS = models.Filter(must=must_field, must_not=mustnot_field)
        
        SEARCH_RESULTS = self.client.query_points(
            collection_name=self.collection_name,
            query=query,
            query_filter=FILTER_RESULTS,
            timeout=self.search_timeout,
            limit=int(k),
        ).points
        
        return_result = self._format_search_results(SEARCH_RESULTS, return_s2t=return_s2t, return_object=return_object)
        
        
        if sort_to_news:
        # if False:
            return_result = sorted(
                return_result,
                key=lambda x: (
                    x['video_name'],
                    x['keyframe_id']
                ),
            )
            group = defaultdict(float)
            score_group = defaultdict(float)
            count = 1
            for i, item in enumerate(return_result):
                key = (item['video_name'], item['keyframe_id'])
                group[key] = key
                if i==0:
                    score_group[group[key]] = float(item['score'])
                    continue
                if (item['video_name']==return_result[i-1]['video_name'] 
                    and int(item['key'])-1 == int(return_result[i-1]['key'])
                    and count<=10):
                    group[key] = group[(return_result[i-1]['video_name'], return_result[i-1]['keyframe_id'])]
                    score_group[group[key]] = max(score_group[group[key]], float(item['score']))
                    count+=1
                else:
                    score_group[group[key]] = float(item['score'])
                    count=0

            return_result = sorted(
                return_result,
                key=lambda x: (
                    score_group[group[(x['video_name'], x['keyframe_id'])]],
                    -int(x['keyframe_id'])
                ),
                reverse=True
            )
        
        return return_result

    def deleteDatabase(self):
        self.client.delete_collection(collection_name=self.collection_name)

    def getCount(self):
        for idx, item in enumerate(self.client.get_collection(collection_name=self.collection_name)):
            if idx == 4:
                return int(item[1])
        return 0

    def search_temporal(self, queryList = List[List[float]],
                        query_main: int=0,
                        k: int = 100, 
                        video_filter: list = [],  
                        s2t_filter: str = None,
                        frame_class_filter: list = [],
                        skip_frames: list = [],
                        return_s2t: bool = True,
                        return_object: bool = True):
        
        must_field = []
        
        if video_filter not in ("", None, []):
            video_filter = video_filter.split(",")
            should_field = []
            for frame_name in video_filter:
                should_field.append(
                    models.FieldCondition(
                        key="video_name",
                        match=models.MatchText(text=frame_name),
                    ),
                )
            must_field.append(models.Filter(should=should_field))
            
        if s2t_filter not in (None,""):
            must_field.append(
                models.FieldCondition(
                    key="s2t",
                    match=models.MatchText(text=s2t_filter),
                )
            )
            
        mustnot_field = []
        if frame_class_filter:
            must_field.append(
                models.FieldCondition(
                    key="frame_class",
                    match=models.MatchAny(any=frame_class_filter),
                ),
            )
        idCondition = set()
        for frame in skip_frames:
            video_name = frame["video_name"]
            frame_name = frame["frame_name"]
            related_start_frame = frame["related_start_frame"]
            related_end_frame = frame["related_end_frame"]
            
            idCondition |= set(self._get_frames(video_name, related_start_frame, related_end_frame))
        mustnot_field.append(models.HasIdCondition(has_id=list(idCondition))) 
        
        queryLen = len(queryList)
        FILTER_RESULTS = models.Filter(must=must_field, must_not=mustnot_field)
        SEARCH_RESULTS = self.client.query_points(
            collection_name=self.collection_name,
            query=queryList[query_main],
            query_filter=FILTER_RESULTS,
            timeout=self.search_timeout,
            limit=int(k) * queryLen,
        ).points

        return_result = self._format_search_results(SEARCH_RESULTS, return_s2t=return_s2t, return_object=return_object)
            
        SEARCH_RESULTS = return_result
        SEARCH_RESULTS = [[result] for result in return_result]
        PREVIOUS_SEARCH_RESULTS = SEARCH_RESULTS
        
        logger.info(f"Processed scene {query_main+1} for temporal with length: {len(PREVIOUS_SEARCH_RESULTS)}")
        
        for query_idx in range(queryLen-1,-1,-1):
            if query_idx >= query_main:
                continue
            
            return_result = []
            FILTER_RESULTS = []
            
            idCondition = set()
            for result in SEARCH_RESULTS:
                split_name = result[0]['idx_folder']
                video_name = result[0]['video_name'].replace('.mp4', '')
                frame = int(result[0]['keyframe_id'])
                idCondition |= set(self._get_frames(video_name, frame-1000, frame-1))
        
            FILTER_RESULTS = models.Filter(must=[models.HasIdCondition(has_id=list(idCondition))])
            
            SEARCH_RESULTS = self.client.query_points(
                collection_name=self.collection_name,
                query=queryList[query_idx],
                query_filter=FILTER_RESULTS,
                limit=int(k) * (queryLen - query_main + query_idx),
                timeout=self.search_timeout,
            ).points
            
            return_result = self._format_search_results(SEARCH_RESULTS, return_s2t=return_s2t, return_object=return_object)
            
            
            SEARCH_RESULTS = return_result
            SEARCH_RESULTS = merge_scores_reverse(SEARCH_RESULTS, PREVIOUS_SEARCH_RESULTS)
            PREVIOUS_SEARCH_RESULTS = SEARCH_RESULTS
            
            logger.info(f"Processed scene {query_idx+1} for temporal with length: {len(PREVIOUS_SEARCH_RESULTS)}")
        
        for query_idx, query in enumerate(queryList):
            if query_idx <= query_main:
                continue
            
            return_result = []
            FILTER_RESULTS = []
            
            idCondition = set()
            for result in SEARCH_RESULTS:
                split_name = result[-1]['idx_folder']
                video_name = result[-1]['video_name'].replace('.mp4', '')
                frame = int(result[-1]['keyframe_id'])
                idCondition |= set(self._get_frames(video_name, frame+1, frame+1000))
        
            FILTER_RESULTS = models.Filter(must=[models.HasIdCondition(has_id=list(idCondition))])
            
            SEARCH_RESULTS = self.client.query_points(
                collection_name=self.collection_name,
                query=query,
                query_filter=FILTER_RESULTS,
                limit=int(k) * (len(queryList) + query_main - query_idx),
                timeout=self.search_timeout,
            ).points
            
            return_result = self._format_search_results(SEARCH_RESULTS, return_s2t=return_s2t, return_object=return_object)
            
            SEARCH_RESULTS = return_result
            SEARCH_RESULTS = merge_scores(PREVIOUS_SEARCH_RESULTS, SEARCH_RESULTS)
            PREVIOUS_SEARCH_RESULTS = SEARCH_RESULTS
            
            logger.info(f"Processed scene {query_idx+1} for temporal with length: {len(PREVIOUS_SEARCH_RESULTS)}")
        if query_main!=0 and query_main+1!=queryLen:
            SEARCH_RESULTS = sorted(SEARCH_RESULTS, key=lambda x: x[0]['score'] + x[-1]['score'] - float(x[query_main]['score']), reverse=True)
        return SEARCH_RESULTS

    def _format_search_results(self,
                               SEARCH_RESULTS: str,
                               use_query: bool=True,
                               return_s2t: bool=False,
                               return_object: bool=False):
        return_result = []
        
        if use_query:
            for item in SEARCH_RESULTS:
                for idx, field in enumerate(item):
                    if idx == 0:
                        key = str(field[1])
                    elif idx == 2:
                        score = str(field[1])
                    elif idx == 3:
                        idx_folder = str(field[1]['idx_folder'])
                        video_name_1 = str(field[1]['video_name'])
                        keyframe_id = str(field[1]['frame_name']).zfill(5)
                        fps = str(field[1]['fps'])
                        frame_class = str(field[1]['frame_class'])
                        related_start_frame = str(field[1]['related_start_frame'])
                        related_end_frame = str(field[1]['related_end_frame'])
                        is_unique = field[1]['is_unique']
                        if return_s2t:
                            s2t = str(field[1]['s2t'])
                        if return_object:
                            obj = ""
                        
                result = {
                    "key": key,
                    "idx_folder": idx_folder,
                    "video_name": video_name_1,
                    "keyframe_id": keyframe_id,
                    "fps": fps,
                    "score": score,
                    "frame_class":frame_class,
                    "is_unique":is_unique,
                    "related_start_frame":related_start_frame,
                    "related_end_frame": related_end_frame,
                }
                if return_s2t:
                    result["s2t"] = s2t
                if return_object:
                    result["object"] = obj
                return_result.append(result)
            
        else:
            for item in SEARCH_RESULTS:
                for idx, field in enumerate(item):
                    if idx == 0:
                        key = str(field[1])
                    elif idx == 1:
                        idx_folder = str(field[1]['idx_folder'])
                        video_name = str(field[1]['video_name'])
                        keyframe_id = str(field[1]['frame_name']).zfill(5)
                        fps = str(field[1]['fps'])
                        frame_class = str(field[1]['frame_class'])
                        related_start_frame = str(field[1]['related_start_frame'])
                        related_end_frame = str(field[1]['related_end_frame'])
                        is_unique = field[1]['is_unique']
                        if return_s2t:
                            s2t = str(field[1]['s2t'])
                        if return_object:
                            obj = ""
                        
                result = {
                    "key": key,
                    "idx_folder": idx_folder,
                    "video_name": video_name,
                    "keyframe_id": keyframe_id,
                    "fps": fps,
                    "score": 0.273,
                    "frame_class":frame_class,
                    "is_unique":is_unique,
                    "related_start_frame":related_start_frame,
                    "related_end_frame": related_end_frame,
                }
                if return_s2t:
                    result["s2t"] = s2t
                if return_object:
                    result["object"] = obj
                return_result.append(result)
                
        return return_result
    
    def _prepare_data(self, folder_path='/mnt/e/random42/data/aic_2025/*'):
        frame_names = {}

        Bpath = folder_path
        lBpath = sorted(glob.glob(Bpath))
        count = 0

        for iBpath in lBpath:
            Lpath = os.path.join(
                iBpath, 
                "frames/low_res_autoshot",
                "Keyframes_*"
            )
            lLpath = sorted(glob.glob(Lpath))
            for iLpath in lLpath:
                Vpath = os.path.join(
                    iLpath, 
                    "keyframes",
                    "*"
                )
                lVpath = sorted(glob.glob(Vpath))
                for iVpath in lVpath:
                    lF = os.listdir(iVpath)
                    name = {int(frame[:5]):count + idx for idx,frame in enumerate(sorted(lF))}
                    frame_names[os.path.basename(iVpath)] = name
                    count+=len(name)
        return frame_names
    def _get_frames(self, video_name, first_frame, last_frame):
        frame_video = self.frame_names[video_name]
        
        list_keys = list(frame_video.keys())
        if first_frame==None:
            first_frame=list_keys[0]
        if last_frame==None:
            last_frame=list_keys[-1]
            
        first_frame, last_frame = int(first_frame), int(last_frame)
        if first_frame not in frame_video:
            id_frame = bisect.bisect_left(list_keys[:-1], first_frame)
            first_frame = list_keys[id_frame]
        if last_frame not in frame_video:
            id_frame = bisect.bisect_right(list_keys[:-1], last_frame)
            last_frame = list_keys[id_frame]
        
        list_values = list(frame_video.values())
        idx = list_values[0]
        first_idx = frame_video[first_frame]
        last_idx = frame_video[last_frame]
        return list_values[first_idx-idx:last_idx-idx+1]
    def _prepare_dup(self, folfer_path="/mnt/e/random42/data/aic_2025/utils/duplicate1"):
        img_dup = {}
        json_names = os.listdir(folfer_path)
        for json_name in json_names:
            video_name, _ = os.path.splitext(json_name)
            json_path = os.path.join(folfer_path, json_name)
            with open(json_path, encoding='utf-8-sig') as json_file:
                img_dup_append = ujson.load(json_file)
            img_dup[video_name] = img_dup_append
        return img_dup
    
    def _prepare_unique(self, folfer_path="/mnt/e/random42/data/aic_2025/utils/unique1"):
        img_unique = {}
        json_names = os.listdir(folfer_path)
        for json_name in json_names:
            video_name, _ = os.path.splitext(json_name)
            json_path = os.path.join(folfer_path, json_name)
            with open(json_path, encoding='utf-8-sig') as json_file:
                img_unique_append = ujson.load(json_file)
            img_unique[video_name] = img_unique_append
        return img_unique