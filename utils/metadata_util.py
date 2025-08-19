import os
import json
import pathlib
from pathlib import Path
import time
import ujson

from PIL import Image
import io

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

from configs.app import AppConfig
from utils.get_k_frames import get_batch


def convert_time_to_frame(video_name, input_time):

    # print(video_name, input_time)

    # parts[0] = minute, parts[1] = second
    parts = input_time.split(":")

    fps = 25.0

    # print(parts)

    # adjust this logic if needed
    with open(
        AppConfig().FPS_PATH[int(get_batch(video_name))], encoding="utf-8-sig"
    ) as infile:
        fps = ujson.load(infile)[video_name.replace(".mp4", "")]

    # print(str(int(float(fps)*(60*int(parts[0])+int(parts[1])))))

    return str(int(float(fps) * (60 * int(parts[0]) + int(parts[1]))))


def pil_image_to_bytes(image: Image.Image, format="PNG") -> bytes:
    """
    Convert a PIL Image to bytes.

    Args:
        image (PIL.Image.Image): The image to convert.
        format (str): The format to save the image in (default is 'PNG').

    Returns:
        bytes: The image converted to bytes.
    """
    with io.BytesIO() as output:
        image.save(output, format=format)
        return output.getvalue()


def bytes_to_pil_image(image_bytes: bytes) -> Image.Image:
    """
    Convert bytes back to a PIL Image.

    Args:
        image_bytes (bytes): The image data in bytes.

    Returns:
        PIL.Image.Image: The converted PIL Image object.
    """
    return Image.open(io.BytesIO(image_bytes))


def get_frame_path(batch, video_name, frame_name):

    frame_path = os.path.join(
        AppConfig().DATASET_PATH_TEAM,
        str(batch),
        "frames",
        AppConfig().SPLIT_NAME,
        f"Keyframes_{str(video_name).split('_')[0]}",
        "keyframes",
        str(video_name.split(".")[0]),
        str(frame_name.split(".")[0]) + f"{AppConfig().LOWRES_FORMAT}",
    )

    return frame_path


def get_video_path(batch, video_name):

    video_filename = str(video_name)
    if not video_filename.endswith(".mp4"):
        video_filename += ".mp4"

    video_path = os.path.join(
        AppConfig().DATASET_PATH_ORIGIN,
        str(batch),
        "videos",
        f"Videos_{str(video_name).split('_')[0]}",
        "video",
        video_filename,
    )

    return video_path
