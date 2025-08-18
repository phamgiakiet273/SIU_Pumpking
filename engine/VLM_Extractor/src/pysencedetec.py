# Tên file: test.py
# Phiên bản hoàn chỉnh: Đọc JSON, xử lý tất cả các shot hợp lệ, và lưu ảnh bằng OpenCV

import json
import os
import numpy as np
import cv2  # Import thư viện OpenCV
import scenedetect
from scenedetect import open_video, FrameTimecode

# --- CÁC THAM SỐ CẤU HÌNH ---
JSON_PATH = "/workspace/nhihtc/perfect/AIC2025/shot/vlm/L01_V001.json"
VIDEO_PATH = "/dataset/AIC2024/original_dataset/0/videos/Videos_L01/video/L01_V001.mp4"
# Thay đổi đường dẫn output sang nơi bạn có quyền ghi file
OUTPUT_DIR = (
    "/workspace/competitions/AIC_2025/SIU_Pumpking/engine/VLM_Extractor/src/output"
)
TARGET_CLASS = 2
FPS = 25
MAX_FRAMES_PER_SHOT = 28


def extract_shots_by_class(
    json_path, video_path, output_dir, target_class, fps, max_frames
):
    """
    Đọc file JSON, lọc theo class, và trích xuất các frame từ video cho tất cả các shot tìm thấy.
    """
    print(f"Bắt đầu xử lý...")
    print(f"JSON nguồn: {json_path}")
    print(f"Video nguồn: {video_path}")

    # Tạo thư mục output chính
    os.makedirs(output_dir, exist_ok=True)

    try:
        # Đọc và phân tích file JSON
        with open(json_path, "r", encoding="utf-8") as f:
            all_shots_data = json.load(f)

        # Lọc ra tất cả các shot có class mong muốn
        target_shots = [
            shot for shot in all_shots_data if shot.get("class") == target_class
        ]

        if not target_shots:
            print(f"Không tìm thấy shot nào có class = {target_class}.")
            return

        print(f"Tìm thấy {len(target_shots)} shot có class = {target_class}.")

        # Mở video một lần để tái sử dụng
        video = open_video(video_path, framerate=fps)

        # Xử lý tuần tự từng shot đã lọc
        for i, shot_data in enumerate(target_shots):
            shot_index = i + 1
            frame_paths = shot_data.get("frames")

            if not frame_paths:
                print(f"\n-> Bỏ qua Shot {shot_index} vì không có danh sách frame.")
                continue

            # Lấy số thứ tự frame đầu và cuối
            frame_numbers = [int(os.path.basename(p)) for p in frame_paths]
            start_frame_num = min(frame_numbers)
            end_frame_num = max(frame_numbers)

            print(f"\n-> Đang xử lý Shot {shot_index}:")
            print(f"   - Khoảng frame: {start_frame_num} đến {end_frame_num}")

            # Tính toán các frame cần trích xuất
            if end_frame_num == start_frame_num:
                frames_to_extract_nums = [start_frame_num]
            else:
                frames_to_extract_nums = np.linspace(
                    start=start_frame_num,
                    stop=end_frame_num,
                    num=min(max_frames, end_frame_num - start_frame_num + 1),
                    dtype=int,
                )

            timecode_list = [
                FrameTimecode(int(frame_num), fps=fps)
                for frame_num in frames_to_extract_nums
            ]

            # Tạo thư mục con riêng cho shot này
            shot_output_dir = os.path.join(
                output_dir,
                f"shot_{shot_index:03d}_frames_{start_frame_num}-{end_frame_num}",
            )
            os.makedirs(shot_output_dir, exist_ok=True)

            # Dùng vòng lặp và OpenCV để lưu ảnh
            for timecode in timecode_list:
                video.seek(timecode)
                frame_image = video.read()
                if frame_image is not None:
                    output_filename = f"frame_{timecode.get_frames():05d}.jpg"
                    output_path = os.path.join(shot_output_dir, output_filename)
                    cv2.imwrite(output_path, frame_image)

            print(
                f"   - Đã trích xuất {len(timecode_list)} frames và lưu tại: {shot_output_dir}"
            )

    except Exception as e:
        print(f"Đã xảy ra lỗi không mong muốn: {e}")
        import traceback

        traceback.print_exc()

    print("\n✅ Hoàn thành!")


if __name__ == "__main__":
    extract_shots_by_class(
        json_path=JSON_PATH,
        video_path=VIDEO_PATH,
        output_dir=OUTPUT_DIR,
        target_class=TARGET_CLASS,
        fps=FPS,
        max_frames=MAX_FRAMES_PER_SHOT,
    )
