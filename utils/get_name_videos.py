from typing import List
import os

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

from dotenv import load_dotenv

load_dotenv()

from configs.app import AppConfig

config = AppConfig()


def get_video_names(batch_numbers: List[int]) -> List[str]:
    """
    Get list of folder names (LXX) followed by video names (LXX_VYYY) from specified batches.

    Args:
        batch_numbers: List of batch numbers (0, 1, 2, ...)

    Returns:
        Combined list of folder names (LXX) followed by video names.
    """
    BASE_PATH = config.DATASET_PATH_ORIGIN
    video_names = []
    lxx_folders = set()

    for batch in sorted(batch_numbers):
        videos_path = os.path.join(BASE_PATH, str(batch), "videos")
        if not os.path.exists(videos_path):
            continue

        video_folders = [f for f in os.listdir(videos_path) if f.startswith("Videos_")]
        video_folders.sort()

        for video_folder in video_folders:
            video_subfolder = os.path.join(videos_path, video_folder, "video")
            if not os.path.exists(video_subfolder):
                continue

            lxx_name = video_folder.split("_")[1]  # eg. "L25"
            lxx_folders.add(lxx_name)

            files = [f for f in os.listdir(video_subfolder) if f.endswith(".mp4")]
            files.sort()
            for file_name in files:
                video_name = os.path.splitext(file_name)[0]
                video_names.append(video_name)

    # Kết hợp danh sách LXX (đã sort) với danh sách video names
    sorted_lxx = sorted(list(lxx_folders))
    return sorted_lxx + video_names


# Test thử:
if __name__ == "__main__":
    result = get_video_names([0])
    print(result)
