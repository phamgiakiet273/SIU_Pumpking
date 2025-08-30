import os
import glob

BASE_PATH = "/dataset/AIC_2025/SIU_Pumpking"

# Config batch → dễ mở rộng
BATCH_CONFIG = {
    0: {"prefix": "L", "ext": ".avif", "split": "low_res_autoshot"},
    1: {"prefix": "K", "ext": ".avif", "split": "low_res_autoshot"},
    2: {"prefix": "X", "ext": ".avif", "split": "low_res_autoshot"},  
}

def get_batch(video_name: str) -> int:
    """Tự động nhận batch từ prefix video_name (L.. → 0, K.. → 1, …)"""
    for batch, cfg in BATCH_CONFIG.items():
        if video_name.startswith(cfg["prefix"]):
            return batch
    raise ValueError(f"Không nhận diện được batch cho video_name: {video_name}")

def get_neighboring_frames(frame_num: str, video_name: str, k: int = 3):
    """
    Lấy k frame trước & sau frame_num trong video.
    frame_num: "00429" (có zero-pad cũng ok)
    video_name: ví dụ "K10_V001"
    k: số frame trước/sau
    """
    batch = get_batch(video_name)
    cfg = BATCH_CONFIG[batch]

    frame_dir = os.path.join(
        BASE_PATH, str(batch), "frames", cfg["split"],
        f"Keyframes_{cfg['prefix']}{video_name[1:3]}", "keyframes", video_name
    )

    all_frames = sorted(glob.glob(os.path.join(frame_dir, f"*{cfg['ext']}")))
    if not all_frames:
        print(f"[WARN] Không tìm thấy frame {cfg['ext']} cho {video_name} trong {frame_dir}")
        return [], []

    # map frame_num (zero-padded) → index
    frame_map = {os.path.splitext(os.path.basename(f))[0]: i for i, f in enumerate(all_frames)}

    if frame_num not in frame_map:
        print(f"[WARN] Frame {frame_num} không có trong {video_name}")
        return [], []

    idx = frame_map[frame_num]
    prev_frames = all_frames[max(0, idx-k):idx]
    next_frames = all_frames[idx+1:idx+1+k]

    return prev_frames, next_frames


# ==========================
# Demo test
# ==========================
if __name__ == "__main__":
    prev, nxt = get_neighboring_frames("03543", "L29_V005", k=2)
    print("Prev:", prev)
    print("Next:", nxt)

    prev, nxt = get_neighboring_frames("09771", "L22_V019", k=2)
    print("Prev:", prev)
    print("Next:", nxt)
