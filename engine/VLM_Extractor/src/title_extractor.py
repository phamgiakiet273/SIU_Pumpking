# file: title_extractor.py
import os
import dotenv
import numpy as np
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
from typing import List
from utils.logger import get_logger

# Import lớp Qwen25VL
from engine.VLM_Extractor.llm_model.qwen25vl.qwen25vl import Qwen25VL

dotenv.load_dotenv()
logger = get_logger()
PROMPT_TITLE_EXTRACTOR_PATH = os.getenv("PROMPT_TITLE_EXTRACTOR_PATH")


class TitleExtractor:
    """
    Lớp ứng dụng chuyên để trích xuất tiêu đề từ các khung hình video.
    Nó sử dụng một instance của Qwen25VL để thực hiện suy luận.
    """

    def __init__(self):
        logger.info("🚀 [TitleExtractor] Đang khởi tạo...")
        self.qwen_model = Qwen25VL()
        logger.info("✅ [TitleExtractor] Đối tượng đã sẵn sàng.")

    def read_prompt(self, PROMPT_TITLE_EXTRACTOR_PATH):
        with open(PROMPT_TITLE_EXTRACTOR_PATH, "r", encoding="utf-8") as file:
            return file.read()

    def _load_frames_parallel(
        self, frame_paths: list, max_workers: int = 16
    ) -> np.ndarray:
        """Tải các frame ảnh song song từ đường dẫn."""

        def _load_single_frame(path: str):
            try:
                # --------------------------------------------------------------------
                # SỬA LỖI NẰM Ở ĐÂY:
                # Đường dẫn `path` được truyền vào đã là đường dẫn đầy đủ,
                # không cần cộng thêm ".jpg" nữa.
                # --------------------------------------------------------------------
                # Dòng cũ (lỗi): return np.array(Image.open(f"{path}.jpg").convert("RGB"))
                # Dòng mới (đã sửa):
                return np.array(Image.open(path).convert("RGB"))
            except Exception as e:
                # Thay đổi đường dẫn trong log để hiển thị đúng đường dẫn đang cố mở
                logger.warning(f"⚠️  Không thể tải frame: {path}. Lỗi: {e}")
                return None

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            results = executor.map(_load_single_frame, frame_paths)
            loaded_frames = [frame for frame in results if frame is not None]

        return np.stack(loaded_frames) if loaded_frames else None

    def extract_from_paths(self, frame_paths: List[str]) -> str:
        """
        Tải các frame từ đường dẫn và trích xuất tiêu đề.
        Đây là hàm chính của lớp này.
        """
        if not frame_paths:
            return "Lỗi: Danh sách đường dẫn frame rỗng."

        logger.info(f"🖼️  [TitleExtractor] Đang tải {len(frame_paths)} khung hình...")
        loaded_frames = self._load_frames_parallel(frame_paths)
        if loaded_frames is None:
            return "Lỗi: Không thể tải bất kỳ frame nào."

        # 1. Chuẩn bị prompt cụ thể cho tác vụ
        user_prompt = self.read_prompt(PROMPT_TITLE_EXTRACTOR_PATH)

        # 2. Tạo payload `messages`
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "video", "video": loaded_frames},
                    {"type": "text", "text": user_prompt},
                ],
            }
        ]

        # 3. Gọi hàm `infer` của đối tượng Qwen25VL đã khởi tạo
        logger.info("🧠 [TitleExtractor] Gửi yêu cầu đến Qwen25VL để suy luận...")
        title = self.qwen_model.infer(messages, max_new_tokens=120)

        logger.info(f"📝 [TitleExtractor] Tiêu đề nhận được: {title}")
        return title
