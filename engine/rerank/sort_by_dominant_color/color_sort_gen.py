from pathlib import Path
import ujson
import math
import colorsys
import os
from tqdm import tqdm

# Add project path
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

from engine.rerank.sort_by_dominant_color.dominant_color import get_dominant_color

# Define dataset paths
dataset_paths = {
    0: {
        "frames_path": "/dataset/KLTN/0/frames/autoshot/",
        "save_path": "/dataset/KLTN/0/rerank/dominant_color/",
    },
    1: {
        "frames_path": "/dataset/KLTN/1/frames/autoshot/",
        "save_path": "/dataset/KLTN/1/rerank/dominant_color/",
    },
    2: {
        "frames_path": "/dataset/KLTN/2/frames/autoshot/",
        "save_path": "/dataset/KLTN/2/rerank/dominant_color/",
    },
}


def get_luminance(r, g, b):
    return math.sqrt(0.241 * r + 0.691 * g + 0.068 * b)


def step_sort_key(r, g, b, repetitions=1):
    lum = get_luminance(r, g, b)
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    h2 = int(h * repetitions)
    lum2 = int(lum * repetitions)
    v2 = int(v * repetitions)

    if h2 % 2 == 1:
        v2 = repetitions - v2
        lum2 = repetitions - lum2

    return (h2, lum2, v2)


def process_dataset(frames_path, save_path):
    frame_paths = list(Path(frames_path).rglob("*.jpg"))

    for frame in tqdm(frame_paths, desc=f"Processing {frames_path}"):
        relative_path = Path(*frame.parts[frame.parts.index("autoshot") :])
        save_json_path = Path(save_path) / relative_path.with_suffix("")

        if save_json_path.with_suffix(".json").exists():
            continue

        save_json_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            dominant_color = get_dominant_color(frame)
            data = {
                "rgb": dominant_color,
                "hsv": colorsys.rgb_to_hsv(*dominant_color),
                "hls": colorsys.rgb_to_hls(*dominant_color),
            }
            with open(save_json_path.with_suffix(".json"), "w") as f:
                ujson.dump(data, f, indent=4)
        except Exception as e:
            print(f"Failed to process {frame}: {e}")


def main():
    for idx, paths in dataset_paths.items():
        process_dataset(paths["frames_path"], paths["save_path"])


if __name__ == "__main__":
    main()
