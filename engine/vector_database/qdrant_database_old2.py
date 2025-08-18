from qdrant_client import QdrantClient, models
from qdrant_client.models import Distance, VectorParams, PointStruct, HnswConfigDiff
from tqdm import tqdm
import os
import numpy as np
import ujson
import glob

from typing import List, Optional, Any
from collections import defaultdict

import sys

sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking")

from utils.metadata_util import get_batch, get_videos_from_batch
from utils.vector_database_util import merge_scores, preprocess_object_dict

from utils.logger import get_logger

logger = get_logger()


class QDRANT:
    def __init__(self, collection_name=None, timeout=1800):
        self.timeout = timeout
        self.collection_name = collection_name

        self.client = QdrantClient(
            url="http://0.0.0.0:6333", port=None, prefer_grpc=True, timeout=self.timeout
        )
        self.frame_names = self._prepare_data()
        logger.info("QDRANT Connection Success")

    def addDatabase(
        self,
        collection_name: str,
        feature_size: int,
        KEYFRAME_FOLDER_PATH: str,
        FEATURES_PATH: List[str],
        SPLIT_NAME: str,
        S2T_PATH: List[str],
        OBJECT_PATH: str,
        FPS_PATH: List[str],
        SHOT_PATH: List[str],
        create_collection: bool = True,
    ):

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
                    ),
                ),
                optimizers_config=models.OptimizersConfigDiff(
                    default_segment_number=8, max_segment_size=2000000000
                ),
                on_disk_payload=True,
                shard_number=95,
                hnsw_config=HnswConfigDiff(
                    m=8,
                    ef_construct=50,
                    full_scan_threshold=0,
                    on_disk=False,
                )  # https://medium.com/@benitomartin/balancing-accuracy-and-speed-with-qdrant-hyperparameters-hydrid-search-and-semantic-caching-part-84b26037e594
                # optimizers_config=models.OptimizersConfigDiff(default_segment_number=64)
            )
            logger.info(f"Collection {collection_name} Created!")
        else:
            logger.info("Collection creation skipped!")

        dict_fps = {}
        for dict_fps_path in FPS_PATH:
            with open(dict_fps_path, encoding="utf-8-sig") as json_file:
                dict_fps_append = ujson.load(json_file)
            dict_fps = dict_fps | dict_fps_append
        logger.info("FPS Dict Loaded")

        dict_s2t = {}
        for dict_s2t_path in S2T_PATH:
            with open(dict_s2t_path, encoding="utf-8-sig") as json_file:
                dict_s2t_append = ujson.load(json_file)
            dict_s2t = dict_s2t | dict_s2t_append
        logger.info("STT Dict Loaded")

        dict_obj = {}
        with open(OBJECT_PATH, encoding="utf-8-sig") as json_file:
            dict_obj = ujson.load(json_file)
        logger.info("Object Dict Loaded")
        dict_obj = preprocess_object_dict(dict_obj)
        logger.info("Object Dict Preprocessed")

        dict_shot = {}
        for dict_shot_path in SHOT_PATH:
            with open(dict_shot_path, encoding="utf-8-sig") as json_file:
                dict_shot_append = ujson.load(json_file)
            dict_shot = dict_shot | dict_shot_append
        logger.info("SHOT Dict Loaded")

        logger.info("Inserting Data...")

        struct_id = 0

        for idx_folder, folder_path in enumerate(FEATURES_PATH):
            insert_points = []

            for feat_npy in tqdm(sorted(os.listdir(folder_path))):
                video_name = feat_npy.split(".")[0]
                npy_path = os.path.join(folder_path, feat_npy)

                # lazy‐load the entire feature array, then batch‐cast & reshape
                feats_arr = np.load(npy_path, mmap_mode="r")
                vectors = feats_arr.astype("float32").reshape(-1, feats_arr.shape[-1])

                # prepare frame list and pre‐parsed frame numbers
                frame_path = (
                    KEYFRAME_FOLDER_PATH
                    + str(idx_folder)
                    + "/frames/"
                    + SPLIT_NAME
                    + "/Keyframes_"
                    + video_name.split("_")[0]
                    + "/keyframes/"
                    + video_name
                )
                frame_list = sorted(os.listdir(frame_path))
                frame_nums = [int(fn.replace(".jpg", "")) for fn in frame_list]

                # pull these out once per file
                fps = dict_fps[video_name]
                s2t_map = (
                    dict_s2t[video_name + ".mp4"]
                    if (video_name + ".mp4") in dict_s2t
                    else ""
                )
                get_objs = dict_obj.get
                shot = dict_shot[video_name] if video_name in dict_shot else ""
                base_id = struct_id

                # build all PointStructs in one go
                points = [
                    PointStruct(
                        id=base_id + idx,
                        vector=vec,
                        payload={
                            "idx_folder": idx_folder,
                            "video_name": video_name + ".mp4",
                            "frame_name": frm,
                            "fps": fps,
                            "s2t": s2t_map[frame_list[idx]] if s2t_map != "" else [],
                            "object": get_objs((video_name, int(frm)), []),
                            "frame_class": shot[frame_list[idx]][0]
                            if shot != ""
                            else 2,
                            "related_start_frame": shot[frame_list[idx]][1]
                            if shot != ""
                            else 0,
                            "related_end_frame": shot[frame_list[idx]][2]
                            if shot != ""
                            else 50000
                            # frame_class: (int / string)
                            # 0 là đoạn có MC
                            # 1 là đoạn tóm tắt
                            # 2 là đoạn chính
                        },
                    )
                    for idx, (vec, frm) in enumerate(zip(vectors, frame_nums))
                ]

                insert_points.extend(points)
                struct_id += len(points)

            operation_info = self.client.upsert(
                collection_name=self.collection_name, wait=False, points=insert_points
            )
            logger.info(
                f"Dataset Insert Completed {str(int(idx_folder)+1)}/{len(FEATURES_PATH)}"
            )

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
            field_name="frame_name",
            field_schema=models.IntegerIndexParams(
                type=models.IntegerIndexType.INTEGER,
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
                lookup=False,
                range=True,
            ),
        )
        logger.info("Create payload index complete")

        return operation_info

    # cho video name, cho start time (00:00), cho end time (01:00) -> tất cả các frame nằm trong khoảng thời gian đó của video đó
    def scroll_video(
        self,
        k,
        video_filter: str,
        time_in: str = None,
        time_out: str = None,
        s2t_filter: str = None,
        frame_class_filter: bool = True,
        skip_frames: list = [],
        return_s2t: bool = True,  # True mặc định là return bth, False là ko return field "s2t" trong cái result ở dưới
        return_object: bool = True,
    ):  # giống cái s2t ở trên, lần này là vs field "object"

        must_field = []

        if video_filter not in ("", None):
            must_field = [
                models.FieldCondition(
                    key="video_name",
                    match=models.MatchValue(value=video_filter + ".mp4"),
                ),
                models.FieldCondition(
                    key="frame_name",
                    range=models.Range(
                        gte=None if time_in in (None, "") else int(time_in),
                        lte=None if time_out in (None, "") else int(time_out),
                    ),
                ),
            ]

        if s2t_filter not in (None, ""):
            must_field.append(
                models.FieldCondition(
                    key="s2t",
                    match=models.MatchText(text=s2t_filter),
                )
            )

        mustnot_field = []
        if frame_class_filter:
            mustnot_field.append(
                models.FieldCondition(
                    key="frame_class",
                    match=models.MatchValue(value=0),
                ),
            )
        for frame in skip_frames:
            video_name = frame["video_name"]
            frame_name = frame["frame_name"]
            related_start_frame = frame["related_start_frame"]
            related_end_frame = frame["related_end_frame"]

            mustnot_field.append(
                models.Filter(
                    must=[
                        models.FieldCondition(
                            key="video_name",
                            match=models.MatchValue(value=video_name + ".mp4"),
                        ),
                        models.FieldCondition(
                            key="frame_name",
                            range=models.Range(
                                gte=related_start_frame, lte=related_end_frame
                            ),
                        ),
                    ]
                )
            )

        FILTER_RESULTS = models.Filter(must=must_field, must_not=mustnot_field)

        SCROLL_RESULT = self.client.scroll(
            collection_name=self.collection_name,
            scroll_filter=FILTER_RESULTS,
            with_payload=True,
            with_vectors=False,
            limit=int(k),
        )

        return_result = self._format_search_results(
            SCROLL_RESULT,
            use_query=False,
            return_s2t=return_s2t,
            return_object=return_object,
        )
        return return_result

    def search(
        self,
        query: List[float],  # feature : float32
        k: int = 100,
        video_filter: str = "",
        s2t_filter: str = None,
        frame_class_filter: bool = True,
        skip_frames: list = [],
        sort_to_news: bool = True,
        return_s2t: bool = True,
        return_object: bool = True,
    ):

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

        if s2t_filter not in (None, ""):
            must_field.append(
                models.FieldCondition(
                    key="s2t",
                    match=models.MatchText(text=s2t_filter),
                )
            )

        mustnot_field = []
        if frame_class_filter:
            mustnot_field.append(
                models.FieldCondition(
                    key="frame_class",
                    match=models.MatchValue(value=0),
                ),
            )
        for frame in skip_frames:
            video_name = frame["video_name"]
            frame_name = frame["frame_name"]
            related_start_frame = frame["related_start_frame"]
            related_end_frame = frame["related_end_frame"]

            mustnot_field.append(
                models.Filter(
                    must=[
                        models.FieldCondition(
                            key="video_name",
                            match=models.MatchValue(value=video_name + ".mp4"),
                        ),
                        models.FieldCondition(
                            key="frame_name",
                            range=models.Range(
                                gte=related_start_frame, lte=related_end_frame
                            ),
                        ),
                    ]
                )
            )

        FILTER_RESULTS = models.Filter(must=must_field, must_not=mustnot_field)

        SEARCH_RESULTS = self.client.query_points(
            collection_name=self.collection_name,
            query=query,
            query_filter=FILTER_RESULTS,
            timeout=self.timeout,
            limit=int(k),
        ).points

        return_result = self._format_search_results(
            SEARCH_RESULTS, return_s2t=return_s2t, return_object=return_object
        )

        if sort_to_news:
            group_max_score = defaultdict(float)
            for item in return_result:
                key = (item["video_name"], item["related_start_frame"])
                group_max_score[key] = max(group_max_score[key], float(item["score"]))

            return_result = sorted(
                return_result,
                key=lambda x: (
                    group_max_score[(x["video_name"], x["related_start_frame"])],
                    x["keyframe_id"],
                ),
                reverse=True,
            )

        return return_result

    def deleteDatabase(self):
        self.client.delete_collection(collection_name=self.collection_name)

    def getCount(self):
        for idx, item in enumerate(
            self.client.get_collection(collection_name=self.collection_name)
        ):
            if idx == 4:
                return int(item[1])
        return 0

    def search_temporal(
        self,
        queryList=List[List[float]],
        k: int = 100,
        video_filter: list = [],
        s2t_filter: str = None,
        frame_class_filter: bool = True,
        skip_frames: list = [],
        return_s2t: bool = True,
        return_object: bool = True,
    ):

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

        if s2t_filter not in (None, ""):
            must_field.append(
                models.FieldCondition(
                    key="s2t",
                    match=models.MatchText(text=s2t_filter),
                )
            )

        mustnot_field = []
        if frame_class_filter:
            mustnot_field.append(
                models.FieldCondition(
                    key="frame_class",
                    match=models.MatchValue(value=0),
                ),
            )
        for frame in skip_frames:
            video_name = frame["video_name"]
            frame_name = frame["frame_name"]
            related_start_frame = frame["related_start_frame"]
            related_end_frame = frame["related_end_frame"]

            mustnot_field.append(
                models.Filter(
                    must=[
                        models.FieldCondition(
                            key="video_name",
                            match=models.MatchValue(value=video_name + ".mp4"),
                        ),
                        models.FieldCondition(
                            key="frame_name",
                            range=models.Range(
                                gte=related_start_frame, lte=related_end_frame
                            ),
                        ),
                    ]
                )
            )

        FILTER_RESULTS = models.Filter(must=must_field, must_not=mustnot_field)
        SEARCH_RESULTS = self.client.query_points(
            collection_name=self.collection_name,
            query=queryList[0],
            query_filter=FILTER_RESULTS,
            timeout=self.timeout,
            limit=int(k) * len(queryList),
        ).points

        return_result = self._format_search_results(
            SEARCH_RESULTS, return_s2t=return_s2t, return_object=return_object
        )

        SEARCH_RESULTS = return_result
        SEARCH_RESULTS = [[result] for result in return_result]
        PREVIOUS_SEARCH_RESULTS = SEARCH_RESULTS

        logger.info("Processed scene 1 for temporal")

        for query_idx, query in enumerate(queryList):
            if query_idx == 0:
                continue

            return_result = []
            FILTER_RESULTS = []

            add_filter = {}
            for result in SEARCH_RESULTS:
                split_name = result[-1]["idx_folder"]
                video_name = result[-1]["video_name"].replace(".mp4", "")
                frame = int(result[-1]["keyframe_id"])
                if video_name not in add_filter:
                    add_filter[video_name] = frame, frame + 1000
                else:
                    add_filter[video_name] = min(frame, add_filter[video_name][0]), max(
                        frame + 1000, add_filter[video_name][1]
                    )

            for video_name, frame in add_filter.items():
                FILTER_RESULTS.append(
                    models.Filter(
                        must=[
                            models.FieldCondition(
                                key="video_name",
                                match=models.MatchValue(value=video_name + ".mp4"),
                            ),
                            models.FieldCondition(
                                key="frame_name",
                                range=models.Range(gt=frame[0], lte=frame[1]),
                            ),
                        ]
                    )
                )

            FILTER_RESULTS = models.Filter(should=FILTER_RESULTS)

            SEARCH_RESULTS = self.client.query_points(
                collection_name=self.collection_name,
                query=query,
                query_filter=FILTER_RESULTS,
                limit=int(k) * (len(queryList) - query_idx),
                timeout=self.timeout,
            ).points

            return_result = self._format_search_results(
                SEARCH_RESULTS, return_s2t=return_s2t, return_object=return_object
            )

            SEARCH_RESULTS = return_result
            SEARCH_RESULTS = merge_scores(PREVIOUS_SEARCH_RESULTS, SEARCH_RESULTS)
            PREVIOUS_SEARCH_RESULTS = SEARCH_RESULTS

            logger.info(f"Processed scene {query_idx+1} for temporal")

        #
        max_dict = {}
        for item in SEARCH_RESULTS:
            key = str(item[-2]["video_name"]) + "_" + str(item[-2]["keyframe_id"])
            if key not in max_dict or item[-1]["score"] > max_dict[key][-1]["score"]:
                max_dict[key] = item
        SEARCH_RESULTS = list(max_dict.values())

        return SEARCH_RESULTS

    # [
    # [ ] list result of scene 1 -> x frames of y videos
    # [ ] list result of scene 2 -> x frames of y video
    # ]
    # -> Duyệt qua toàn scene, list ra những cái video unique, xong rồi kiếm trong scene với scene 2 để ghép vô thành list video theo hàng
    # -> Làm việc trên ở trên server luôn
    # [
    # video_name_1: top_frame_of_scene_1, top_frame_of_scene_2, ... (theo số scene)
    # video_name_2:
    # ... video_name_k:
    # video_name sẽ sắp xếp theo thứ tự của scene cuối
    # ]
    def _format_search_results(
        self,
        SEARCH_RESULTS: str,
        use_query: bool = True,
        return_s2t: bool = False,
        return_object: bool = False,
    ):
        return_result = []

        if use_query:
            for item in SEARCH_RESULTS:
                for idx, field in enumerate(item):
                    if idx == 0:
                        key = str(field[1])
                    elif idx == 2:
                        score = str(field[1])
                    elif idx == 3:
                        idx_folder = str(field[1]["idx_folder"])
                        video_name = str(field[1]["video_name"])
                        keyframe_id = str(field[1]["frame_name"]).zfill(5)
                        fps = str(field[1]["fps"])
                        frame_class = str(field[1]["frame_class"])
                        related_start_frame = str(field[1]["related_start_frame"])
                        related_end_frame = str(field[1]["related_end_frame"])
                        if return_s2t:
                            s2t = str(field[1]["s2t"])
                        if return_object:
                            obj = str(field[1]["object"])

                result = {
                    "key": key,
                    "idx_folder": idx_folder,
                    "video_name": video_name,
                    "keyframe_id": keyframe_id,
                    "fps": fps,
                    "score": score,
                    "frame_class": frame_class,
                    "related_start_frame": related_start_frame,
                    "related_end_frame": related_end_frame,
                }
                if return_s2t:
                    result["s2t"] = s2t
                if return_object:
                    result["object"] = obj
                return_result.append(result)

        else:
            for item in SEARCH_RESULTS[0]:
                for idx, field in enumerate(item):
                    if idx == 0:
                        key = str(field[1])
                    elif idx == 1:
                        idx_folder = str(field[1]["idx_folder"])
                        video_name = str(field[1]["video_name"])
                        keyframe_id = str(field[1]["frame_name"]).zfill(5)
                        fps = str(field[1]["fps"])
                        frame_class = str(field[1]["frame_class"])
                        related_start_frame = str(field[1]["related_start_frame"])
                        related_end_frame = str(field[1]["related_end_frame"])
                        if return_s2t:
                            s2t = str(field[1]["s2t"])
                        if return_object:
                            obj = str(field[1]["object"])

                result = {
                    "key": key,
                    "idx_folder": idx_folder,
                    "video_name": video_name,
                    "keyframe_id": keyframe_id,
                    "fps": fps,
                    "score": 0.273,
                    "frame_class": frame_class,
                    "related_start_frame": related_start_frame,
                    "related_end_frame": related_end_frame,
                }
                if return_s2t:
                    result["s2t"] = s2t
                if return_object:
                    result["object"] = obj
                return_result.append(result)

        return return_result

    def _prepare_data(self, folder_path="/dataset/AIC2024/pumkin_dataset/Vinh/*"):
        frame_names = {}

        Bpath = folder_path
        lBpath = glob.glob(Bpath)
        count = 0

        for iBpath in lBpath:
            Lpath = os.path.join(iBpath, "frames/autoshot", "Keyframes_L*")
            lLpath = glob.glob(Lpath)
            for iLpath in lLpath:
                Vpath = os.path.join(iLpath, "keyframes", "L*")
                lVpath = glob.glob(Vpath)
                for iVpath in lVpath:
                    lF = os.listdir(iVpath)
                    name = {
                        int(frame[:5]): count + idx
                        for idx, frame in enumerate(sorted(lF))
                    }
                    frame_names[os.path.basename(iVpath)] = name
                    count += len(name)
        return frame_names

    def _get_frames(self, video_name, first_frame, last_frame):
        first_frame, last_frame = int(first_frame), int(last_frame)
        frame_video = self.frame_names[video_name]
        list_frames = list(frame_video.values())
        idx = list_frames[0]
        first_idx = frame_video[first_frame]
        last_idx = frame_video[last_frame]
        return sorted(list_frames[first_idx - idx : last_idx - idx + 1])
