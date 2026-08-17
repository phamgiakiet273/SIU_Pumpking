import os
from typing import Dict, List, Any
import cv2
import json
import numpy as np

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

os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"  # see issue #152
os.environ["CUDA_VISIBLE_DEVICES"] = "2"

from engine.shot_boundary_detection.Shot_Detection.shot_detecion_selector import (
    ShotDetection,
)
from engine.shot_boundary_detection.Shot_Detection.io_setup import (
    setup_video_path,
    SceneJsonLoader,
    CutKeyFrameLoader,
)

model = ShotDetection("autoshot")


def split_video_into_frame(input_dir, output_folder):

    all_video_paths = setup_video_path(input_dir)

    prediction_scenes = model.run_model(video_path_dict=all_video_paths)

    sceneJson_dir = output_folder + "/SceneJson"
    os.makedirs(sceneJson_dir, exist_ok=True)
    json_handling = SceneJsonLoader(prediction_scenes, sceneJson_dir)
    json_handling.save_results()

    keyframe_dir = output_folder + "/keyframes"
    keyframe_handler = CutKeyFrameLoader(sceneJson_dir, keyframe_dir)
    keyframe_handler.extract_keyframes(all_video_paths)


split_video_into_frame(
    "/dataset/AIC2024/original_dataset/0/videos", "/dataset/KLTN/0/frames/autoshot"
)

split_video_into_frame(
    "/dataset/AIC2024/original_dataset/1/videos", "/dataset/KLTN/1/frames/autoshot"
)

split_video_into_frame(
    "/dataset/AIC2024/original_dataset/2/videos", "/dataset/KLTN/2/frames/autoshot"
)
