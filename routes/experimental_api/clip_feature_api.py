import flask
from flask import request
import os
import numpy as np
import urllib.parse
import json
import sys
import ujson
import bisect
import pillow_avif
import requests
import subprocess
import ast

os.environ[
    "TRANSFORMERS_CACHE"
] = "/workspace/competitions/AIC_2025/SIU_Pumpking/data/weights"
os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"  # see issue #152
os.environ["CUDA_VISIBLE_DEVICES"] = "2"
sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking/")

from engine.vector_database.qdrant_database import QDRANT


FEATURES_PATH = [
    "/dataset/KLTN/0/features/siglip/",
    "/dataset/KLTN/1/features/siglip/",
    "/dataset/KLTN/2/features/siglip/",
]
KEYFRAME_FOLDER_PATH = "/dataset/KLTN/"
SPLIT_NAME = "autoshot"
DATASET_INDEX = "/dataset/KLTN/index/"
S2T_PATH = [
    "/dataset/KLTN/0/speech_to_text/transcript_all_autoshot_segmented.json",
    "/dataset/KLTN/1/speech_to_text/transcript_all_autoshot_segmented.json",
    "/dataset/KLTN/2/speech_to_text/transcript_all_autoshot_segmented.json",
]
OBJECT_PATH = "/dataset/KLTN/object/total_json.json"

FPS_PATH = [
    "/dataset/KLTN/fps/video_fps_0.json",
    "/dataset/KLTN/fps/video_fps_1.json",
    "/dataset/KLTN/fps/video_fps_2.json",
]

from engine.CLIPFeatureModel.siglip_model import SIGLIP

model = SIGLIP()

qdrant = QDRANT("KLTN_SIGLIP_AIC_2024")
qdrant.addDatabase(
    "KLTN_SIGLIP_AIC_2024",
    1152,
    KEYFRAME_FOLDER_PATH,
    FEATURES_PATH,
    SPLIT_NAME,
    S2T_PATH,
    OBJECT_PATH,
    FPS_PATH,
)

dummy_query = (
    np.load("/workspace/competitions/AIC_2025/SIU_Pumpking/data/example/cat_siglip.npy")
    .reshape(1, -1)
    .astype("float32")[0]
)
qdrant.search(dummy_query, 3, "", "", "")
print("Dummy Query Finished")


def preprocessing_text(text):
    global model
    text_feat_arr = model.get_text_features(text)
    text_feat_arr = text_feat_arr.reshape(1, -1).astype("float32")  # => float32
    return text_feat_arr[0]


def preprocessing_image(image):
    global model
    image_feat_arr = model.get_image_features(image)
    image_feat_arr = image_feat_arr.reshape(1, -1).astype("float32")  # => float32
    return image_feat_arr[0]


list_shot_dict = {}


# Gọi lên chạy
app = flask.Flask("API Clip Feature Search")
app.config["DEBUG"] = False

app.config["CACHE_TYPE"] = "RedisCache"
app.config["CACHE_REDIS_HOST"] = "localhost"
app.config["CACHE_REDIS_PORT"] = 6379


@app.route("/preprocess")
def preprocess():
    text = ""
    k = ""

    if request.method == "POST":
        text = request.json["text"]
        k = request.json["k"]
    else:
        text = request.args.get("text")
        k = request.args.get("k")

    if text[-1] == ".":
        text = text[:-1]

    text_feat_arr = preprocessing_text(text)
    print(f"text: {text}")

    response = flask.jsonify(text_feat_arr.tolist())
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    response.success = True
    return response


@app.route("/scroll")
def scroll():
    video_filter = ""
    time_in = ""
    time_out = ""
    s2t_filter = ""

    if request.method == "POST":
        k = request.json["k"]
        video_filter = request.json["video_filter"]
        time_in = request.json["time_in"]
        time_out = request.json["time_out"]
    else:
        k = request.args.get("k")
        video_filter = request.args.get("video_filter")
        time_in = request.args.get("time_in")
        time_out = request.args.get("time_out")

    scroll_result = qdrant.scroll_video(k, video_filter, time_in, time_out)

    response = flask.jsonify(scroll_result)
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    response.success = True
    return response


@app.route("/text_search")
def text_search():
    global db, faiss_db

    text = ""
    k = ""
    video_filter = ""
    time_in = ""
    time_out = ""

    if request.method == "POST":
        text = request.json["text"]
        k = request.json["k"]
        video_filter = request.json["video_filter"]
        time_in = request.json["time_in"]
        time_out = request.json["time_out"]
    else:
        text = request.args.get("text")
        k = request.args.get("k")
        video_filter = request.args.get("video_filter")
        time_in = request.args.get("time_in")
        time_out = request.args.get("time_out")

    # MODEL A
    text_feat_arr_A = preprocessing_text(text)
    search_results_A = qdrant.search(
        text_feat_arr_A, int(k), video_filter, time_in, time_out
    )
    response = flask.jsonify(search_results_A)
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    response.success = True
    return response


@app.route("/image_search")
def image_search():
    global db, faiss_db

    image = ""
    k = ""
    video_filter = ""
    time_in = ""
    time_out = ""
    s2t_filter = ""

    if request.method == "POST":
        image = request.json["image_url"]
        k = request.json["k"]
        video_filter = request.json["video_filter"]
        time_in = request.json["time_in"]
        time_out = request.json["time_out"]
    else:
        image = request.args.get("image_url")
        k = request.args.get("k")
        video_filter = request.args.get("video_filter")
        time_in = request.args.get("time_in")
        time_out = request.args.get("time_out")

    # MODEL A
    img_feat_arr_A = preprocessing_image(image)
    search_results_A = qdrant.search(
        img_feat_arr_A, int(k), video_filter, time_in, time_out
    )
    response = flask.jsonify(search_results_A)
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    response.success = True
    return response


@app.route("/temporal_search")
def temporal_search():

    text = ""
    k = ""
    video_filter = ""
    time_in = ""
    time_out = ""
    s2t_filter = ""

    if request.method == "POST":
        text = request.json["text"]
        k = request.json["k"]
        video_filter = request.json["video_filter"]
        time_in = request.json["time_in"]
        time_out = request.json["time_out"]
    else:
        text = request.args.get("text")
        k = request.args.get("k")
        video_filter = request.args.get("video_filter")
        time_in = request.args.get("time_in")
        time_out = request.args.get("time_out")

    if text[-1] == ".":
        text = text[:-1]
    print(f"text: {text}")

    text_list = text.split(".", 100)
    queryList = []

    for idx, item in enumerate(text_list):
        queryList.append(preprocessing_text(item.rstrip(".").replace("*", "")))

    search_results = qdrant.search_temporal(
        queryList, int(k), video_filter, time_in, time_out
    )
    response = flask.jsonify(search_results)
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    response.success = True
    return response


# if __name__ == '__main__':
#     app.run(host="0.0.0.0", port= 8502, debug=False)
