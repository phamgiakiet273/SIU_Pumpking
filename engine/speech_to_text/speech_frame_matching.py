import torch
from transformers import AutoModel, AutoTokenizer
import py_vncorenlp
import re

import numpy as np
from numpy import dot
from numpy.linalg import norm


def cosine(a, b):
    cos_sim = dot(a, b) / (norm(a) * norm(b))
    return cos_sim


class PhoBERT:
    def __init__(self) -> None:
        self.device = "cuda"
        self.phobert = AutoModel.from_pretrained("vinai/phobert-base-v2")
        self.tokenizer = AutoTokenizer.from_pretrained("vinai/phobert-base-v2")
        # py_vncorenlp.download_model(save_dir='/workspace/competitions/AIC_2024/SIU_Pumpkin/base_2023/SIU_Pumpkin/libs/VNcoreNLP')
        self.rdrsegmenter = py_vncorenlp.VnCoreNLP(
            annotators=["wseg"],
            save_dir="/workspace/competitions/AIC_2024/SIU_Pumpkin/base_2023/SIU_Pumpkin/libs/VNcoreNLP",
        )

    def remove_special_character(self, text: str):
        chars_to_ignore = "[^\ a-zA-Z_àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹýÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝ]"
        text = re.sub(chars_to_ignore, "", text.lower())
        return text

    def segmenter(self, text: str):
        if len(text) == 0:
            return text
        text = self.remove_special_character(text)
        text = self.rdrsegmenter.word_segment(text)
        text = text[0].split(" ")
        text = [x.replace("_", " ") for x in text]
        return text

    def extract(self, text: str):
        input_ids = torch.tensor([self.tokenizer.encode(text)])
        input_ids.to(self.device)
        with torch.no_grad():
            features = self.phobert(input_ids)[0].numpy().squeeze(0)
        return features


import json
import os
import pathlib
from pathlib import Path
import numpy as np

import pandas as pd
from collections import defaultdict, OrderedDict

speech_json_0 = "/dataset/KLTN/0/speech_to_text/"
keyframe_jpg_0 = "/dataset/KLTN/0/frames/autoshot/"
save_path_0 = "/dataset/KLTN/0/speech_to_text/"
fps_dict_0 = "/dataset/KLTN/fps/video_fps_0.json"

speech_json_1 = "/dataset/KLTN/1/speech_to_text/"
keyframe_jpg_1 = "/dataset/KLTN/1/frames/autoshot/"
save_path_1 = "/dataset/KLTN/1/speech_to_text/"
fps_dict_1 = "/dataset/KLTN/fps/video_fps_1.json"

speech_json_2 = "/dataset/KLTN/2/speech_to_text/"
keyframe_jpg_2 = "/dataset/KLTN/2/frames/autoshot/"
save_path_2 = "/dataset/KLTN/2/speech_to_text/"
fps_dict_2 = "/dataset/KLTN/fps/video_fps_2.json"

fps_dict_all = {}

with open(fps_dict_0, "r", encoding="utf-8-sig") as infile:
    fps_dict_all.update(json.load(infile))

with open(fps_dict_1, "r", encoding="utf-8-sig") as infile:
    fps_dict_all.update(json.load(infile))

with open(fps_dict_2, "r", encoding="utf-8-sig") as infile:
    fps_dict_all.update(json.load(infile))

phobert = PhoBERT()


def matching(speech_json, keyframe_jpg, save_path):
    total_dict = {}
    for video_json in Path(speech_json).glob("*.json"):

        video_name = str(os.path.basename(video_json)).replace(".json", "")
        if not (video_name.startswith("L")):
            continue
        keyframes_folder = (
            keyframe_jpg + "Keyframes_" + video_name[:3] + "/keyframes/" + video_name
        )
        with open(str(video_json), encoding="utf-8-sig") as f:
            data = json.load(f)

        transcript_dict = {}
        for frame_transcript in data.items():
            start_frame = ""
            end_frame = ""
            for i in range(0, len(frame_transcript[0])):
                if frame_transcript[0][i] == "_":
                    end_frame = frame_transcript[0][i + 1 :]
                    break
                start_frame += frame_transcript[0][i]
            start_frame = int(start_frame)
            end_frame = int(end_frame)
            transcript_dict[(start_frame, end_frame)] = phobert.segmenter(
                frame_transcript[1]
            )

        video_dict = {}

        # prev_transcript = ""

        for file in Path(keyframes_folder).glob("**/*.jpg"):
            if not file.is_file():  # Skip directories
                continue
            pic_name = str(os.path.basename(str(file)))
            pic_frame = int(os.path.basename(str(file).replace(".jpg", "")))
            second = float(pic_frame) / float(fps_dict_all[video_name])
            for x in transcript_dict.keys():
                if second >= x[0] and second <= x[1]:
                    print(second, x[0], x[1], transcript_dict[x])
                    video_dict[pic_name] = transcript_dict[x]
                    # prev_transcript = transcript_dict[x]
                    break
                if x[0] > second:
                    break
            print(file)

            if not pic_name in video_dict:
                for x in transcript_dict.keys():
                    transcript = transcript_dict[x]
                    if x[0] > second:
                        break
                video_dict[pic_name] = transcript
            # prev_transcript = video_dict[pic_name]

        video_dict = OrderedDict(sorted(video_dict.items()))
        total_dict[str(video_name + ".mp4")] = video_dict
        total_dict = OrderedDict(sorted(total_dict.items()))
        with open(
            save_path + "transcript_all_autoshot_segmented.json",
            "w",
            encoding="utf-8-sig",
        ) as outfile:
            json.dump(total_dict, outfile, indent=4, ensure_ascii=False)


matching(speech_json_0, keyframe_jpg_0, save_path_0)
matching(speech_json_1, keyframe_jpg_1, save_path_1)
matching(speech_json_2, keyframe_jpg_2, save_path_2)
