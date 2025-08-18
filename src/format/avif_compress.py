import os
import pathlib
from pathlib import Path
from PIL import Image
import pillow_avif
from tqdm import tqdm  # Import tqdm

dataset_0 = "/dataset/KLTN/0/frames/autoshot/"
dataset_1 = "/dataset/KLTN/1/frames/autoshot/"
dataset_2 = "/dataset/KLTN/2/frames/autoshot/"
# dataset_test = "/dataset/AIC2024/pumkin_dataset/2/frames/autoshot/"
# low_res_path = "/dataset/AIC2023/pumkin_dataset/0/frames/low_res/"


def compress_image_folder(high_res_path):
    images = list(Path(high_res_path).glob("**/*.jpg"))
    for image in tqdm(images, desc=f"Compressing {high_res_path}"):
        if not image.is_file():
            continue
        image = str(image)
        picture = Image.open(image)
        low_res_folder = Path(image.replace("autoshot", "low_res_autoshot")).parents[0]
        low_res_folder.mkdir(parents=True, exist_ok=True)
        low_res_image = str(image).replace("autoshot", "low_res_autoshot")
        picture.save(
            str(low_res_image).replace(".jpg", ".avif"),
            "AVIF",
            optimize=True,
            quality=10,
        )


compress_image_folder(dataset_0)
compress_image_folder(dataset_1)
compress_image_folder(dataset_2)
# compress_image_folder(dataset_test)
