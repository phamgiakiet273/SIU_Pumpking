import os
import cv2
import pathlib
from pathlib import Path
from collections import OrderedDict
import json


def get_fps(video_path):
    print(video_path)
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    # cap.release()
    return fps


total_dict = OrderedDict()

# data_path = "/dataset/AIC2023/original_dataset/2/"

data_path = "/dataset/AIC2024/original_dataset/0/videos/"

for file in Path(data_path).glob("**/*.mp4"):
    if not file.is_file():  # Skip directories
        continue
    video_name = file.stem
    total_dict.update({video_name: get_fps(str(file))})
    with open("video_fps_0.json", "w", encoding="utf-8-sig") as json_save:
        json.dump(total_dict, json_save, indent=4, ensure_ascii=False)
