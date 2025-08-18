from qdrant_client import QdrantClient, models
from qdrant_client.models import Distance, VectorParams, PointStruct
from tqdm import tqdm
import os
import numpy as np
import ujson
import time

from typing import List, Optional, Any

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
    ):

        self.collection_name = collection_name
        self.size = feature_size

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

        if self.client.collection_exists(collection_name=collection_name):
            logger.warning("Collection existed, deleting...")
            self.client.delete_collection(collection_name=self.collection_name)

        self.client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=feature_size,
                distance=Distance.COSINE,
                quantization_config=models.BinaryQuantization(
                    binary=models.BinaryQuantizationConfig(always_ram=True),
                ),
            ),
            on_disk_payload=True,
            shard_number=96,
            optimizers_config=models.OptimizersConfigDiff(default_segment_number=64),
        )
        logger.info("Collection Created!")

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
                s2t_map = dict_s2t[video_name + ".mp4"]
                get_objs = dict_obj.get
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
                            "s2t": s2t_map[frame_list[idx]],
                            "object": get_objs((video_name, int(frm)), []),
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
            field_schema=models.KeywordIndexParams(
                type="keyword",
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
        logger.info("Create payload index complete")

        return operation_info

    def scroll_video(
        self,
        k,
        video_filter: str,
        time_in: str = None,
        time_out: str = None,
        s2t_filter: str = None,
    ):

        field_condition = [
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
            field_condition.append(
                models.FieldCondition(
                    key="s2t",
                    match=models.MatchText(text=s2t_filter),
                )
            )

        FILTER_RESULTS = models.Filter(must=field_condition)

        SCROLL_RESULT = self.client.scroll(
            collection_name=self.collection_name,
            scroll_filter=FILTER_RESULTS,
            with_payload=True,
            with_vectors=False,
            limit=int(k),
        )
        return_result = []
        for item in SCROLL_RESULT[0]:
            for idx, field in enumerate(item):
                if idx == 0:
                    key = str(field[1])
                elif idx == 1:
                    idx_folder = str(field[1]["idx_folder"])
                    video_name = str(field[1]["video_name"])
                    keyframe_id = str(field[1]["frame_name"]).zfill(5)
                    fps = str(field[1]["fps"])
                    s2t = str(field[1]["s2t"])
                    obj = str(field[1]["object"])

            result = {
                "key": key,
                "idx_folder": idx_folder,
                "video_name": video_name,
                "keyframe_id": keyframe_id,
                "fps": fps,
                "score": 0.273,
                "s2t": s2t,
                "object": obj,
            }
            return_result.append(result)

        return return_result

    def search(
        self,
        query: List[float],  # feature : float32
        k: int = 100,
        video_filter: str = None,
        time_in: str = None,
        time_out: str = None,
        s2t_filter: str = None,
    ):

        if video_filter in ("", None):
            search_results = self.client.query_points(
                collection_name=self.collection_name,
                query=query,
                timeout=self.timeout,
                limit=int(k),
            ).points
        else:
            field_condition = [
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
                field_condition.append(
                    models.FieldCondition(
                        key="s2t",
                        match=models.MatchText(text=s2t_filter),
                    )
                )

            FILTER_RESULTS = models.Filter(must=field_condition)

            search_results = self.client.query_points(
                collection_name=self.collection_name,
                query=query,
                query_filter=FILTER_RESULTS,
                timeout=self.timeout,
                limit=int(k),
            ).points

        return_result = []

        for item in search_results:
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
                    s2t = str(field[1]["s2t"])
                    obj = str(field[1]["object"])

            result = {
                "key": key,
                "idx_folder": idx_folder,
                "video_name": video_name,
                "keyframe_id": keyframe_id,
                "fps": fps,
                "score": score,
                "s2t": s2t,
                "object": obj,
            }
            return_result.append(result)

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
        video_filter: str = None,
        time_in: str = None,
        time_out: str = None,
        s2t_filter: str = None,
        return_list: bool = False,
    ):

        LIST_RESULT = []

        if video_filter in ("", None):
            SEARCH_RESULTS = self.client.query_points(
                collection_name=self.collection_name,
                query=queryList[0],
                timeout=self.timeout,
                limit=int(k) * len(queryList),
            ).points
        else:
            field_condition = [
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
                field_condition.append(
                    models.FieldCondition(
                        key="s2t",
                        match=models.MatchText(text=s2t_filter),
                    )
                )

            FILTER_RESULTS = models.Filter(must=field_condition)
            SEARCH_RESULTS = self.client.query_points(
                collection_name=self.collection_name,
                query=queryList[0],
                query_filter=FILTER_RESULTS,
                timeout=self.timeout,
                limit=int(k) * len(queryList),
            ).points

        return_result = []

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
                    s2t = str(field[1]["s2t"])
                    obj = str(field[1]["object"])

            result = {
                "key": key,
                "idx_folder": idx_folder,
                "video_name": video_name,
                "keyframe_id": keyframe_id,
                "fps": fps,
                "score": score,
                "s2t": s2t,
                "object": obj,
            }
            return_result.append(result)

        SEARCH_RESULTS = return_result
        PREVIOUS_SEARCH_RESULTS = SEARCH_RESULTS

        LIST_RESULT.append(SEARCH_RESULTS)
        logger.info("Processed scene 1 for temporal")

        for query_idx, query in enumerate(queryList):
            if query_idx == 0:
                continue

            return_result = []
            FILTER_RESULTS = []

            for result in SEARCH_RESULTS:
                split_name = result["idx_folder"]
                video_name = result["video_name"].replace(".mp4", "")
                frame = result["keyframe_id"]

                FILTER_RESULTS.append(
                    models.Filter(
                        must=[
                            models.FieldCondition(
                                key="video_name",
                                match=models.MatchValue(value=video_name + ".mp4"),
                            ),
                            models.FieldCondition(
                                key="frame_name",
                                range=models.Range(
                                    gte=int(frame), lte=int(frame) + 1000
                                ),
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

            return_result = []

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
                        s2t = str(field[1]["s2t"])
                        obj = str(field[1]["object"])

                result = {
                    "key": key,
                    "idx_folder": idx_folder,
                    "video_name": video_name,
                    "keyframe_id": keyframe_id,
                    "fps": fps,
                    "score": score,
                    "s2t": s2t,
                    "object": obj,
                }
                return_result.append(result)

            SEARCH_RESULTS = return_result
            SEARCH_RESULTS = merge_scores(PREVIOUS_SEARCH_RESULTS, SEARCH_RESULTS)
            PREVIOUS_SEARCH_RESULTS = SEARCH_RESULTS

            LIST_RESULT.append(SEARCH_RESULTS)
            logger.info(f"Processed scene {query_idx+1} for temporal")

        if return_list:
            return LIST_RESULT

        return SEARCH_RESULTS
