import os
import ujson
import json
from collections import defaultdict

import sys

sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking")


def merge_scores(list_res_A, list_res_B):
    idx_results = {}
    # Iterate over list_res_B
    for record_B in list_res_B:
        max_temp_score = 0.0
        video_name = record_B["video_name"]
        keyframe_id = record_B["keyframe_id"]
        # Iterate over list_res_A to find matching records
        for idx_A, record_A in enumerate(list_res_A):
            # Check if video_name matches and keyframe_id difference is less than 1000
            if (
                record_A[-1]["video_name"] == record_B["video_name"]
                and int(record_B["keyframe_id"]) - int(record_A[-1]["keyframe_id"]) >= 0
                and int(record_B["keyframe_id"]) - int(record_A[-1]["keyframe_id"])
                <= 1000
            ):
                if float(record_A[-1]["score"]) > max_temp_score:
                    max_temp_score = float(record_A[-1]["score"])
                    idx_results[(video_name, keyframe_id)] = idx_A

        # Update the score in B
        record_B["score"] = float(record_B["score"]) + max_temp_score

    # resort the score
    sorted_list = sorted(list_res_B, key=lambda x: x["score"], reverse=True)
    results = []
    for record_B in sorted_list:
        video_name = record_B["video_name"]
        keyframe_id = record_B["keyframe_id"]
        if (video_name, keyframe_id) not in idx_results:
            continue
        idx_A = idx_results[(video_name, keyframe_id)]
        record_A = list_res_A[idx_A]
        results.append(record_A + [record_B])

    max_dict = {}
    for item in results:
        key = str(item[-2]["video_name"]) + "_" + str(item[-2]["keyframe_id"])
        if key not in max_dict or item[-1]["score"] > max_dict[key][-1]["score"]:
            max_dict[key] = item
    results = list(max_dict.values())

    return results


def preprocess_object_dict(object_dict):
    """
    Flattens and groups detections by (video, frame) key.

    Args:
        object_dict (dict): Mapping from object name to list of detection dicts,
                            each containing 'video', 'frame', 'conf', and 'bbox'.

    Returns:
        dict: Keys are (video, frame) tuples, values are lists of dicts with keys:
              'object', 'conf', 'bbox'.
    """
    # Group detections by video and frame
    nested = defaultdict(lambda: defaultdict(list))
    for obj_name, det_list in object_dict.items():
        for det in det_list:
            vid = det["video"]
            # convert frame to int for normalization
            frm = int(det["frame"])
            nested[vid][frm].append(
                {
                    "object": obj_name,
                    "conf": det["conf"],
                    "bbox": det["bbox"],
                }
            )

    # Flatten nested structure into {(video, frame): [...]}
    return {
        (vid, frm): objs
        for vid, frames in nested.items()
        for frm, objs in frames.items()
    }


def preprocessing_text(model, text):
    text_feat_arr = model.get_text_features(text)
    text_feat_arr = text_feat_arr.reshape(1, -1).astype("float32")  # => float32
    return text_feat_arr[0]


def preprocessing_image(model, image):
    image_feat_arr = model.get_image_features(image)
    image_feat_arr = image_feat_arr.reshape(1, -1).astype("float32")  # => float32
    return image_feat_arr[0]
