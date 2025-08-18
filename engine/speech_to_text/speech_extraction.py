from SpeechToText import SpeechToText
import pathlib
from pathlib import Path
import os
import json
from collections import defaultdict, OrderedDict
import pandas as pd

s2t = SpeechToText()

dataset_video_path_0 = "/dataset/AIC2024/original_dataset/0/videos/"
json_save_path_0 = "/dataset/KLTN/0/speech_to_text/"

dataset_video_path_1 = "/dataset/AIC2024/original_dataset/1/videos/"
json_save_path_1 = "/dataset/KLTN/1/speech_to_text/"

dataset_video_path_2 = "/dataset/AIC2024/original_dataset/2/videos/"
json_save_path_2 = "/dataset/KLTN/2/speech_to_text/"

# dataset_video_path_1 = "/dataset/AIC2024/original_dataset/1/videos/"
# json_save_path_1 = "/dataset/AIC2024/pumkin_dataset/1/speech_to_text/"

# dataset_video_path_0 = "/dataset/AIC2024/original_dataset/1/videos/"
# json_save_path_0 = "/dataset/AIC2024/pumkin_dataset/1/speech_to_text/"

# dataset_video_path_2 = "/dataset/AIC2023/original_dataset/2/videos/"
# json_save_path_2 = "/dataset/AIC2023/pumkin_dataset/2/speech_to_text/"

# dataset_video_path_1 = "/dataset/AIC2024/original_dataset/1/videos/"
# json_save_path_1 = "/dataset/AIC2024/pumkin_dataset/1/speech_to_text/"

# dataset_video_path_test = "/dataset/AIC2023/original_dataset/0/videos/"
# json_save_path_test = "/dataset/AIC2024/pumkin_dataset/0/speech_to_text/"


def folder_scan(data_path: str, save_path: str):
    total_dict = {}
    for file in Path(data_path).glob("**/*.mp4"):
        if not file.is_file():  # Skip directories
            continue
        video_name = pathlib.PurePath(file).name
        video_save_path = save_path + str(video_name).replace(".mp4", "") + "/"
        video_save_path = Path(video_save_path)
        video_save_path.mkdir(parents=True, exist_ok=True)
        video_json_path = str(video_save_path) + ".json"
        video_dict = s2t.video_to_text(
            video_path=str(file), wav_path=str(video_save_path) + "/"
        )
        with open(video_json_path, "w", encoding="utf-8-sig") as outfile:
            json.dump(video_dict, outfile, indent=4, ensure_ascii=False)
        total_dict.update({str(video_name).replace(".mp4", ""): video_dict})
        total_dict = OrderedDict(total_dict)
        with open(
            save_path + "transcript_all.json", "w", encoding="utf-8-sig"
        ) as outfile:
            json.dump(total_dict, outfile, indent=4, ensure_ascii=False)
        print(file)


folder_scan(dataset_video_path_0, json_save_path_0)
folder_scan(dataset_video_path_1, json_save_path_1)
folder_scan(dataset_video_path_2, json_save_path_2)


# folder_scan(dataset_video_path_1, json_save_path_1)
# folder_scan(dataset_video_path_0, json_save_path_0)
# folder_scan(dataset_video_path_test, json_save_path_test)
