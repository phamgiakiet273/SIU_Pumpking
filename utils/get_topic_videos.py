import os
import re

# --- Cấu hình chủ đề bằng khoảng xuyên prefix ---
TOPIC_RANGES = {
    "ThoiSu": [
        ("L21", 1, "L22", 31),   # L20_V001 đến L23_V034
    ],
    "DuaXeDap": [
        ("L23", 1, "L23", 25),  # L23_V035 đến L25_V030
    ],
    "MuaLan": [
        ("L24", 1, "L24", 45), # L25_V031 đến L27_V999
    ],  
    "BaiGiang": [
        ("L25", 1, "L25", 88),  # L28_V001 đến L29_V999
    ],
    "NauAn": [
        ("L26", 1, "L26", 499),  # L30_V001 đến L30_V999
    ],
    "DuLich": [
        ("L27", 1, "L27", 16),  # K01_V001 đến K20_V999
    ],
    "DoiSongMeKong": [
        ("L28", 1, "L29", 23),  # K01_V001 đến K20_V999
    ],
    "ClipDuThiHerbalife": [
        ("L30", 1, "L30", 96),  # K01_V001 đến K20_V999
    ],
}

def parse_video(video_name: str):
    """Parse 'L23_V035' -> ('L23', 35)"""
    m = re.match(r"([A-Z]\d+)_V(\d+)", video_name)
    if not m:
        return None, None
    return m.group(1), int(m.group(2))

def prefix_key(prefix: str, vnum: int) -> tuple:
    """
    Convert (prefix, vnum) -> sortable key.
    Ví dụ: 'L23', 35 -> ('L', 23, 35).
    """
    return (prefix[0], int(prefix[1:]), vnum)

def in_range(prefix, vnum, start_pref, start_v, end_pref, end_v):
    """Check (prefix,vnum) nằm trong range (start,end)"""
    cur = prefix_key(prefix, vnum)
    s = prefix_key(start_pref, start_v)
    e = prefix_key(end_pref, end_v)
    return s <= cur <= e

def get_topic_from_video(video_name: str) -> str:
    prefix, vnum = parse_video(video_name)
    if not prefix: return "Unknown"
    for topic, ranges in TOPIC_RANGES.items():
        for (sp, sv, ep, ev) in ranges:
            if in_range(prefix, vnum, sp, sv, ep, ev):
                return topic
    return "Unknown"

def get_videos_from_topic(topic: str, all_videos: list[str]) -> list[str]:
    return [v for v in all_videos if get_topic_from_video(v) == topic]

def load_all_videos(root="/dataset/AIC_2025/original_dataset"):
    all_videos = []
    for i in [0, 1, 2]:
        base = os.path.join(root, str(i), "videos")
        if not os.path.exists(base):
            continue
        for dirpath, _, filenames in os.walk(base):
            for f in filenames:
                if f.endswith(".mp4"):
                    all_videos.append(os.path.splitext(f)[0])
    return all_videos

# --- Test ---
if __name__ == "__main__":
    test = ["L28_V001", "L28_V012", "L24_V015", "L25_V025", "L26_V499", "L30_V080"]
    for v in test:
        print(v, "->", get_topic_from_video(v)) 
    all_videos = load_all_videos("/dataset/AIC_2025/original_dataset")
    print(get_videos_from_topic("DoiSongMeKong", all_videos)[:1000])  # In 10 video đầu của chủ đề NauAn