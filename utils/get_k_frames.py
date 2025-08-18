import os
import json
from typing import Tuple, List
import sys

sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking/")

from dotenv import load_dotenv

load_dotenv()

from configs.util import UtilConfig
from configs.app import AppConfig

# Khởi tạo config
config = UtilConfig()

# Gọi lại BASE_PATH
base_path = config.DATASET_PATH_TEAM
print("BASE_PATH:", base_path)


def get_batch(video_name: str) -> int:
    """
    Xác định batch (0, 1, hoặc 2) dựa trên số trong video_name.
    """
    try:
        # Tách "L01_V001" → "01"
        num = int(video_name.split("_")[0][1:])
    except (IndexError, ValueError):
        raise ValueError("video_name phải có định dạng 'Lxx_Vyyy'")

    if 21 <= num <= 30:
        return 0


def get_neighboring_frames(
    frame_num: str, video_name: str, k: int
) -> Tuple[List[str], List[str]]:
    """
    Lấy k frame trước và k frame sau của frame_num trong video_name.
    Trả về tuple chứa danh sách đường dẫn tới các file .avif.
    """
    # Xác định batch
    batch = get_batch(video_name)

    # Xây dựng đường dẫn tới file JSON
    json_path = os.path.join(base_path, f"{batch}/index/{video_name}.json")
    if not os.path.exists(json_path):
        raise FileNotFoundError(f"File JSON {json_path} không tồn tại")

    # Đọc file JSON
    with open(json_path, "r") as f:
        frame_index = json.load(f)

    # Kiểm tra frame_num có trong JSON không
    if frame_num not in frame_index:
        raise ValueError(f"Frame {frame_num} không tồn tại trong {video_name}.json")

    # Lấy index của frame hiện tại
    current_index = frame_index[frame_num]

    # Tìm k frame trước
    prev_frames = []
    for i in range(1, k + 1):
        prev_index = current_index - i
        # Tìm frame tương ứng với prev_index
        prev_frame = next((k for k, v in frame_index.items() if v == prev_index), None)
        if prev_frame is None:
            break
        prev_frames.append(prev_frame)

    # Tìm k frame sau
    next_frames = []
    for i in range(1, k + 1):
        next_index = current_index + i
        # Tìm frame tương ứng với next_index
        next_frame = next((k for k, v in frame_index.items() if v == next_index), None)
        if next_frame is None:
            break
        next_frames.append(next_frame)

    # Xác định xx từ video_name (ví dụ: "01" từ "L01_V001")
    xx = video_name.split("_")[0][1:]

    # Xây dựng đường dẫn cơ bản
    frame_base_path = os.path.join(
        base_path,
        f"{batch}/frames/{AppConfig().SPLIT_NAME}/Keyframes_L{xx}/keyframes/{video_name}",
    )

    # Tạo danh sách đường dẫn cho cả prev_frames và next_frames
    prev_paths = [
        os.path.join(frame_base_path, f"{frame.zfill(5)}.avif") for frame in prev_frames
    ]
    next_paths = [
        os.path.join(frame_base_path, f"{frame.zfill(5)}.avif") for frame in next_frames
    ]

    # Đảo ngược prev_paths để giữ thứ tự thời gian tăng dần
    prev_paths.reverse()

    return prev_paths, next_paths


# Ví dụ sử dụng
if __name__ == "__main__":
    try:
        prev_frames, next_frames = get_neighboring_frames(
            frame_num="40", video_name="L25_V008", k=30
        )
        print("Frame trước:", prev_frames)
        print("Frame sau:", next_frames)
    except (ValueError, FileNotFoundError) as e:
        print(f"Lỗi: {e}")
