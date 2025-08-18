#!/usr/bin/env python3

import os
import json
import glob
from collections import defaultdict
from tqdm import tqdm


def aggregate_detections(root_dir, save_every=100, output_file="total_json.json"):
    """
    Traverse all object_detection JSON files under root_dir, collect detections by label,
    and periodically save aggregated results sorted by confidence.

    Args:
        root_dir (str): Base dataset directory (e.g., '/dataset/KLTN').
        save_every (int): Number of files to process before each intermediate save.
        output_file (str): Path for the final aggregated JSON output.
    """
    # Container for all detections, keyed by label
    detections = defaultdict(list)

    # Pattern matching all JSON files under */object_detection
    pattern = os.path.join(root_dir, "*", "object_detection", "*.json")
    json_files = glob.glob(pattern)

    # Iterate with progress bar
    for idx, json_path in enumerate(tqdm(json_files, desc="Processing JSON files")):
        try:
            with open(json_path, "r") as f:
                data = json.load(f)
        except Exception as e:
            print(f"Warning: could not load {json_path}: {e}")
            continue

        # Derive video name (without extension) from filename
        video_name = os.path.splitext(os.path.basename(json_path))[0]

        # Collect detections for each frame
        for frame_id, objs in data.items():
            for obj in objs:
                label = obj.get("label")
                bbox = obj.get("bbox")
                score = obj.get("score")

                # Append detection entry
                detections[label].append(
                    {
                        "video": video_name,
                        "frame": frame_id,
                        "conf": score,
                        "bbox": bbox,
                    }
                )

        # Periodic save to avoid losing progress
        if (idx + 1) % save_every == 0:
            save_aggregated(detections, output_file)

    # Final save after all files processed
    save_aggregated(detections, output_file)


def save_aggregated(detections, output_file):
    """
    Sort entries for each label by descending confidence and serialize to JSON.
    """
    aggregated = {}
    for label, entries in detections.items():
        # Sort by confidence descending
        sorted_entries = sorted(entries, key=lambda x: x["conf"], reverse=True)
        aggregated[label] = sorted_entries

    with open(output_file, "w") as f:
        json.dump(aggregated, f, indent=2)

    print(
        f"Saved aggregated results to {output_file} ({sum(len(v) for v in aggregated.values())} total detections)"
    )


if __name__ == "__main__":
    ROOT_DIR = "/dataset/AIC2024/pumkin_dataset/Vinh"
    OUTPUT_FILE = os.path.join(ROOT_DIR, "total_json.json")
    # You can adjust save_every as needed (e.g., 500, 1000, 2000)
    aggregate_detections(ROOT_DIR, save_every=1000, output_file=OUTPUT_FILE)
