# # from models.BLIPFeaturesExtractor import Blip
# from models.BLIP2FeaturesExtractor import BLIP2


import os

os.environ[
    "TRANSFORMERS_CACHE"
] = "/workspace/competitions/AIC_2025/SIU_Pumpking/data/weights"
import numpy as np
from tqdm import tqdm

import sys

sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking/")
from engine.CLIPFeatureModel.siglip_model import SIGLIP

os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"  # see issue #152
os.environ["CUDA_VISIBLE_DEVICES"] = "2"


model = SIGLIP()

KEY_FRAME_PATH = "/dataset/KLTN/0/frames/autoshot/"
FEATURE_PATH = "/dataset/KLTN/0/features/siglip/"


def batch_0():
    print("Starting")
    for i in range(1, 13):
        video_list_path = f"{KEY_FRAME_PATH}Keyframes_L{i:02d}/keyframes/"
        print(video_list_path)
        for video_name in os.listdir(video_list_path):
            frame_list = video_list_path + video_name + "/"
            video_feature = []
            print(video_name)
            for frame_name in tqdm(sorted(os.listdir(frame_list))):
                if ".csv" in frame_name:
                    continue
                frame_path = frame_list + "/" + frame_name
                frame_feature = model.get_image_features(frame_path)  #############
                video_feature.append(frame_feature)
            video_feature = np.array(video_feature)
            np.save(FEATURE_PATH + video_name + ".npy", video_feature)


batch_0()

KEY_FRAME_PATH = "/dataset/KLTN/1/frames/autoshot/"
FEATURE_PATH = "/dataset/KLTN/1/features/siglip/"


def batch_1():
    print("Starting")
    for i in range(13, 25):
        video_list_path = f"{KEY_FRAME_PATH}Keyframes_L{i:02d}/keyframes/"
        print(video_list_path)
        for video_name in os.listdir(video_list_path):
            frame_list = video_list_path + video_name + "/"
            video_feature = []
            print(video_name)
            for frame_name in tqdm(sorted(os.listdir(frame_list))):
                if ".csv" in frame_name:
                    continue
                frame_path = frame_list + "/" + frame_name
                frame_feature = model.get_image_features(frame_path)  #############
                video_feature.append(frame_feature)
            video_feature = np.array(video_feature)
            np.save(FEATURE_PATH + video_name + ".npy", video_feature)


batch_1()

KEY_FRAME_PATH = "/dataset/KLTN/2/frames/autoshot/"
FEATURE_PATH = "/dataset/KLTN/2/features/siglip/"


def batch_2():
    print("Starting")
    for i in range(25, 31):
        video_list_path = f"{KEY_FRAME_PATH}Keyframes_L{i:02d}/keyframes/"
        print(video_list_path)
        for video_name in os.listdir(video_list_path):
            frame_list = video_list_path + video_name + "/"
            video_feature = []
            print(video_name)
            for frame_name in tqdm(sorted(os.listdir(frame_list))):
                if ".csv" in frame_name:
                    continue
                frame_path = frame_list + "/" + frame_name
                frame_feature = model.get_image_features(frame_path)  #############
                video_feature.append(frame_feature)
            video_feature = np.array(video_feature)
            np.save(FEATURE_PATH + video_name + ".npy", video_feature)


batch_2()
