from qdrant_client import QdrantClient, models
from qdrant_client.models import Distance, VectorParams, PointStruct
from tqdm import tqdm
import os
import numpy as np
import ujson
import time

from pathlib import Path
import sys

current_path = Path(__file__).resolve()
for parent in current_path.parents:
    if parent.name == "SIU_Pumpking":
        #print(f"Adding {parent} to sys.path")
        sys.path.append(str(parent))
        break
else:
    raise RuntimeError("Could not find 'SIU_Pumpking' in the path hierarchy.")

from utils.metadata_util import get_split, get_videos_from_split
from utils.vector_database_util import merge_scores, preprocess_object_dict


class QDRANT:
    def __init__(self, collection_name=None, timeout=900):

        self.timeout = timeout
        self.collection_name = collection_name

        self.client = QdrantClient(
            url="http://0.0.0.0:6333", port=None, prefer_grpc=True, timeout=self.timeout
        )
        print("QDRANT Connection Success")

    def addDatabase(
        self,
        collection_name,
        feature_size,
        KEYFRAME_FOLDER_PATH,
        FEATURES_PATH,
        SPLIT_NAME,
        S2T_PATH,
        OBJECT_PATH,
        FPS_PATH,
    ):

        self.collection_name = collection_name
        self.size = feature_size

        dict_fps = {}
        for dict_fps_path in FPS_PATH:
            with open(dict_fps_path, encoding="utf-8-sig") as json_file:
                dict_fps_append = ujson.load(json_file)
            dict_fps = dict_fps | dict_fps_append
        print("FPS Dict Loaded")

        dict_s2t = {}
        for dict_s2t_path in S2T_PATH:
            with open(dict_s2t_path, encoding="utf-8-sig") as json_file:
                dict_s2t_append = ujson.load(json_file)
            dict_s2t = dict_s2t | dict_s2t_append
        print("STT Dict Loaded")

        dict_obj = {}
        with open(OBJECT_PATH, encoding="utf-8-sig") as json_file:
            dict_obj = ujson.load(json_file)
        print("Object Dict Loaded")
        dict_obj = preprocess_object_dict(dict_obj)
        print("Object Dict Preprocessed")

        if self.client.collection_exists(collection_name=collection_name) == True:
            print("Collection existed, deleting...")
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
        print("Collection Created!")

        print("Inserting Data...")

        struct_id = 0
        insert_points = []
        for idx_folder, folder_path in enumerate(FEATURES_PATH):
            # print(folder_path)
            for feat_npy in tqdm(sorted(os.listdir(folder_path))):
                # print(feat_npy)
                video_name = feat_npy.split(".")[0]
                feats_arr = np.load(os.path.join(folder_path, feat_npy))
                # frame_path = KEYFRAME_FOLDER_PATH + str(idx_folder) +"/frames/pyscenedetect/Keyframes_" + str(video_name).split("_")[0]  + "/keyframes/"  + str(video_name.split(".")[0])
                frame_path = (
                    KEYFRAME_FOLDER_PATH
                    + str(idx_folder)
                    + "/frames/"
                    + SPLIT_NAME
                    + "/Keyframes_"
                    + str(video_name).split("_")[0]
                    + "/keyframes/"
                    + str(video_name.split(".")[0])
                )
                frame_list = sorted(os.listdir(frame_path))

                for idx, feat in enumerate(feats_arr):
                    feat_reshaped = feat.reshape(1, -1).astype("float32")[0]
                    frame_number = frame_list[idx].replace(".jpg", "").lstrip("0")

                    frame_objects = dict_obj.get(video_name, {}).get(frame_number, [])
                    insert_points.append(
                        PointStruct(
                            id=struct_id,
                            vector=feat_reshaped,
                            payload={
                                "idx_folder": idx_folder,
                                "video_name": video_name + ".mp4",
                                "frame_name": int(frame_list[idx].replace(".jpg", "")),
                                "fps": dict_fps[video_name],
                                "s2t": dict_s2t[video_name + ".mp4"][frame_list[idx]],
                                "object": frame_objects,
                            },
                        )
                    )
                    struct_id += 1

        operation_info = self.client.upsert(
            collection_name=self.collection_name, wait=False, points=insert_points
        )

        print("Dataset Insert Completed")

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

        print("Create payload index complete")

        return operation_info

    def scroll_video(self, k, video_filter, time_in, time_out):

        field_condition = [
            models.FieldCondition(
                key="video_name",
                match=models.MatchValue(value=video_filter + ".mp4"),
            ),
            models.FieldCondition(
                key="frame_name",
                range=models.Range(
                    gte=None if time_in == "" else int(time_in),
                    lte=None if time_out == "" else int(time_out),
                ),
            ),
        ]

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

            result = {
                "key": key,
                "idx_folder": idx_folder,
                "video_name": video_name,
                "keyframe_id": keyframe_id,
                "fps": fps,
                "score": 0.273,
            }

            return_result.append(result)

        return return_result

    def search(self, query, k, video_filter, time_in, time_out):

        if video_filter == "" or video_filter == None:
            search_results = self.client.query_points(
                collection_name=self.collection_name,
                query=query,
                timeout=self.timeout,
                limit=int(k),
                # score_threshold=0.2
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
                        gte=None if time_in == "" else int(time_in),
                        lte=None if time_out == "" else int(time_out),
                    ),
                ),
            ]

            FILTER_RESULTS = models.Filter(must=field_condition)

            search_results = self.client.query_points(
                collection_name=self.collection_name,
                query=query,
                query_filter=FILTER_RESULTS,
                timeout=self.timeout,
                limit=int(k),
                # score_threshold=0.2
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

            result = {
                "key": key,
                "idx_folder": idx_folder,
                "video_name": video_name,
                "keyframe_id": keyframe_id,
                "fps": fps,
                "score": score,
            }
            return_result.append(result)

        return return_result

    def deleteDatabase(self):
        self.client.delete_collection(collection_name=self.collection_name)

    def getCount(self):
        for idx, item in enumerate(
            self.client.get_collection(collection_name=self.collection_name)
        ):
            # print(item)
            if idx == 4:
                return int(item[1])
        return 0

    def search_temporal(self, queryList, k, video_filter, time_in, time_out):

        if video_filter == "" or video_filter == None:
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
                        gte=None if time_in == "" else int(time_in),
                        lte=None if time_out == "" else int(time_out),
                    ),
                ),
            ]

            FILTER_RESULTS = models.Filter(must=field_condition)
            SEARCH_RESULTS = self.client.query_points(
                collection_name=self.collection_name,
                query=queryList[0],
                query_filter=FILTER_RESULTS,
                timeout=self.timeout,
                limit=int(k) * len(queryList),
                # score_threshold=0.2
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

            result = {
                "key": key,
                "idx_folder": idx_folder,
                "video_name": video_name,
                "keyframe_id": keyframe_id,
                "fps": fps,
                "score": score,
            }
            return_result.append(result)

        SEARCH_RESULTS = return_result
        PREVIOUS_SEARCH_RESULTS = SEARCH_RESULTS
        for idx, query in enumerate(queryList):
            if idx == 0:
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
                limit=int(k) * (len(queryList) - idx),
                timeout=self.timeout,
                # score_threshold=0.2
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

                result = {
                    "key": key,
                    "idx_folder": idx_folder,
                    "video_name": video_name,
                    "keyframe_id": keyframe_id,
                    "fps": fps,
                    "score": score,
                }
                return_result.append(result)

            SEARCH_RESULTS = return_result
            SEARCH_RESULTS = merge_scores(PREVIOUS_SEARCH_RESULTS, SEARCH_RESULTS)
            PREVIOUS_SEARCH_RESULTS = SEARCH_RESULTS

        return SEARCH_RESULTS
