import math
import requests
from flask import (
    Flask,
    request,
    render_template,
    send_from_directory,
    jsonify,
    send_file,
)
import os
import ujson
from collections import OrderedDict
import pillow_avif
import sys
import json
import urllib.parse
import ast
import time
import io
import zipfile

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

app = Flask(__name__)

# app.debug = True
# app.config["APPLICATION_ROOT"] = "/aic/1/"
app.config["CACHE_TYPE"] = "RedisCache"
app.config["CACHE_REDIS_HOST"] = "localhost"
app.config["CACHE_REDIS_PORT"] = 6379
from flask_compress import Compress

app.config["COMPRESS_MIMETYPES"] = ["text/html", "text/css", "application/json"]
app.config["COMPRESS_LEVEL"] = 6  # Default compression level
app.config[
    "COMPRESS_MIN_SIZE"
] = 500  # Minimum response size (in bytes) to trigger compression
Compress(app)


DATASET_PATH_ORIGIN = os.getenv("DATASET_PATH_ORIGIN")
DATASET_PATH_TEAM = os.getenv("DATASET_PATH_TEAM")
# SPLIT_NAME = 'pyscenedetect'
# SPLIT_NAME = 'low_res_t_5'
SPLIT_NAME_LOW_RES = "low_res_autoshot"

IMG_FORMAT = ".avif"
# IMG_FORMAT = '.jpg'

# init
frame_dir_dict = {}


print("Server boosted!")


def convert_time_to_frame(video_name, input_time):
    parts = input_time.split(":")
    try:
        url_text = "https://phamgiakiet273.ngrok.app/scroll?k={}&video_filter={}&time_in={}&time_out={}".format(
            1, video_name, 0, 0
        )
        result = requests.get(url_text).json()
        fps = result[0]["fps"]
    except:
        url_text = "http://localhost:7000/scroll?k={}&video_filter={}&time_in={}&time_out={}".format(
            1, video_name, 0, 0
        )
        result = requests.get(url_text).json()
        fps = result[0]["fps"]
    return int(float(fps) * (60 * int(parts[0]) + int(parts[1])))


@app.route("/img/<path:filename>")
def download_file(filename):
    # filename = filename.rstrip('/')
    directory = os.path.dirname(filename)
    video_name = os.path.basename(filename)
    return send_from_directory(directory="/" + directory, path=video_name)


@app.route("/video/<path:filename>/<path:keyframe>")
def video(filename, keyframe):
    filename = filename + "/" + keyframe
    filename = filename.split("/dataset/")[0]
    video_name = keyframe.split("/", keyframe.count("/"))[-2]  # video in server
    frame_name = keyframe.split("/", keyframe.count("/"))[-1]

    true_id = int(frame_name.split(".")[0])
    url_text = "http://localhost:7000/scroll?k={}&video_filter={}&time_in={}&time_out={}".format(
        1, video_name, 0, 0
    )
    result = requests.get(url_text).json()

    fps = float(result[0]["fps"])

    true_id = int(true_id) / fps

    mi = str(int(true_id / 60))
    if len(mi) == 1:
        mi = "0" + mi
    se = str(int(true_id % 60))
    if len(se) == 1:
        se = "0" + se
    video_info = video_name + ", " + mi + ":" + se + ", " + str(int(fps))

    return render_template(
        "video.html", source=filename, keyframe=true_id, id=video_info
    )


@app.route("/keyframes/<path:keyframe>")
def keyframes(keyframe):
    keyframes_path = os.path.dirname(keyframe)
    frame_name = keyframe.split("/", keyframe.count("/"))[-1]
    list_frame = []
    list_from_dir = sorted(os.listdir("/" + keyframes_path))
    id_frame_name = list_from_dir.index(frame_name)
    if id_frame_name < 20:
        start_id = 0
    else:
        start_id = id_frame_name - 50

    if len(list_from_dir) - id_frame_name < 20:
        end_id = len(list_from_dir)
    else:
        end_id = id_frame_name + 50
    for i in sorted(os.listdir("/" + keyframes_path))[start_id:end_id]:
        list_frame.append([keyframes_path + "/" + i, i])
    return render_template("keyframes.html", files=list_frame, current_frame=frame_name)


@app.route("/download_zip", methods=["POST"])
def download_zip():
    # Expecting a JSON payload with a list of filenames
    file_list = request.json.get("files", [])

    if not file_list:
        return jsonify({"error": "No files provided"}), 400

    # Create a BytesIO object to hold the ZIP data in memory
    zip_buffer = io.BytesIO()

    # Create a new ZIP file in memory
    with zipfile.ZipFile(
        zip_buffer, "w", zipfile.ZIP_DEFLATED, compresslevel=9
    ) as zip_file:
        for filepath in file_list:
            # Ensure the file exists before adding it to the ZIP
            if os.path.exists(filepath):
                # Add the file to the ZIP archive with its base name (without directory structure)
                zip_file.write(filepath, filepath)
            else:
                return jsonify({"error": f"File {filepath} does not exist"}), 404

    # Move the pointer to the beginning of the BytesIO buffer
    zip_buffer.seek(0)

    # Send the ZIP file as a download, with a custom filename
    return send_file(
        zip_buffer,
        mimetype="application/zip",
        as_attachment=False,
        download_name="files.zip",
    )


@app.route("/", methods=["GET", "POST"])
def index():
    st = time.time()
    if request.method == "POST":

        # GET VALUES
        text = request.form["query"]
        image = request.form["fname"]
        model_port = request.form["model"]
        k = request.form["k"]
        video_filter = request.form["video_filter"]
        time_in = request.form["time_in"]
        time_out = request.form["time_out"]
        # -----RESULT
        lst_video_name = []

        # print(s2t_filter)

        if ":" in time_in:
            time_in = convert_time_to_frame(video_filter, time_in)
        if ":" in time_out:
            time_out = convert_time_to_frame(video_filter, time_out)

        if text != "":
            if "/" in text:
                if "http" not in text:
                    text = "/dataset/KLTN/" + text[text.find("frames") - 2 :]
                # url_text = "http://localhost:7000/image_search?image_url={}&k={}&video_filter={}&time_in={}&time_out={}".format("/dataset/AIC2024/pumkin_dataset/" + text[text.find("frames")-2:],k,video_filter,time_in,time_out)
                url_text = "http://localhost:7000/image_search?image_url={}&k={}&video_filter={}&time_in={}&time_out={}".format(
                    text, k, video_filter, time_in, time_out
                )

                result = requests.get(url_text).json()
                lst_video_name = result
            else:
                if model_port == "SIGLIP":
                    url_text = "http://localhost:7000/text_search?text={}&k={}&video_filter={}&time_in={}&time_out={}".format(
                        text, k, video_filter, time_in, time_out
                    )
                    result = requests.get(url_text).json()  ######
                    lst_video_name = result
                elif model_port == "TEMPORAL_SIGLIP":
                    url_text = "http://localhost:7000/temporal_search?text={}&k={}&video_filter={}&time_in={}&time_out={}".format(
                        text, k, video_filter, time_in, time_out
                    )
                    result = requests.get(url_text).json()  ######
                    lst_video_name = result
        elif video_filter != "":
            video_filter = str(video_filter).upper()
            url_text = "http://localhost:7000/scroll?k={}&video_filter={}&time_in={}&time_out={}".format(
                k, video_filter, time_in, time_out
            )
            result = requests.get(url_text).json()
            lst_video_name = result

        # print(time.time()-st)
        # RETURN VALUES
        files = []
        list_frames = []
        if int(k) > len(lst_video_name):
            k = int(len(lst_video_name))

        for _, info in enumerate(lst_video_name):
            video_path = (
                DATASET_PATH_ORIGIN
                + str(info["idx_folder"])
                + "/videos/Videos_"
                + str(info["video_name"]).split("_")[0]
                + "/video/"
                + str(info["video_name"])
            )
            frame_path = (
                DATASET_PATH_TEAM
                + str(info["idx_folder"])
                + "/frames/"
                + SPLIT_NAME_LOW_RES
                + "/Keyframes_"
                + str(info["video_name"]).split("_")[0]
                + "/keyframes/"
                + str(info["video_name"].split(".")[0])
                + "/"
                + info["keyframe_id"]
                + IMG_FORMAT
            )

            fps = float(info["fps"])
            frame_name = info["keyframe_id"].replace("'", "") + IMG_FORMAT

            # get true time in video
            true_id = int(info["keyframe_id"].replace("'", ""))
            video_time = math.floor(true_id / fps)
            mi = str(video_time // 60)
            if len(mi) == 1:
                mi = "0" + mi
            se = str(int(video_time % 60))
            if len(se) == 1:
                se = "0" + se
            video_info = (
                info["video_name"] + ", " + mi + ":" + se + ", " + str(int(fps))
            )

            # list next frame
            frame_dir = os.path.dirname(frame_path)
            if frame_dir not in frame_dir_dict.keys():
                frame_dir_dict[frame_dir] = sorted(os.listdir(frame_dir))

            list_frame_in_dir = frame_dir_dict[frame_dir]

            start_index = list_frame_in_dir.index(frame_name)
            end_index = len(list_frame_in_dir) - 1
            if end_index - start_index > 20:
                end_index = start_index + 20

            if start_index < 20:
                start_index = 0
            else:
                start_index -= 20
            list_frame = [
                frame_dir + "/" + image
                for image in list_frame_in_dir[start_index:end_index:2]
            ]

            # full list
            list_frames.append(list_frame)
            files.append((_, frame_path, frame_name, video_info, video_path, fps))

        scroll = True

        return render_template(
            "index.html",
            files=files,
            query=text,
            image=image,
            count=str(len(files)) + " files found.",
            list_frames=json.dumps(list_frames),
            model=model_port,
            scroll=scroll,
            k=k,
        )
    else:
        return render_template("index.html")
