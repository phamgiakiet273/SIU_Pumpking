# file: caption.py

import json
import re
from pathlib import Path
from typing import List, Optional, Dict, Any
import os
import dotenv
import numpy as np
from PIL import Image

from utils.logger import get_logger

# >>> THAY ĐỔI 1: Import lớp Qwen25VL chung mà bạn đã tạo
from engine.VLM_Extractor.llm_model.qwen25vl.qwen25vl import Qwen25VL

# ==============================================================================
# INITIALIZATION
# ==============================================================================
logger = get_logger()
dotenv.load_dotenv()
PROMPT_CAPTION_PATH = os.getenv("PROMPT_CAPTION_PATH")

# ==============================================================================
# MAIN CLASS
# ==============================================================================


class EventLocalizer:
    """
    Sử dụng model Qwen2.5-VL để xác định và khoanh vùng các sự kiện trong một
    phân cảnh video (shot), dựa trên hình ảnh và ngữ cảnh văn bản.
    Lớp này gọi đến lớp Qwen25VL chung để thực hiện suy luận.
    """

    def __init__(self):
        """
        Khởi tạo EventLocalizer bằng cách gọi lớp Qwen25VL chung.
        """
        logger.info("🚀 [EventLocalizer] Đang khởi tạo Qwen25VL dùng chung...")
        # >>> THAY ĐỔI 2: Sử dụng lại lớp Qwen25VL của bạn.
        # Toàn bộ logic tải model phức tạp đã được chuyển vào đây.
        self.qwen_model = Qwen25VL()

        # Tải prompt template như bình thường
        self.prompt_template = self._load_prompt_template(PROMPT_CAPTION_PATH)
        logger.info("✅ [EventLocalizer] Đối tượng đã sẵn sàng.")

    def _load_prompt_template(self, template_path: str) -> str:
        """Tải nội dung prompt từ một file text."""
        # ... (Hàm này không thay đổi)
        if not template_path:
            raise ValueError("PROMPT_CAPTION_PATH chưa được thiết lập trong .env")
        path = Path(template_path)
        if not path.exists():
            raise FileNotFoundError(f"Không tìm thấy file prompt tại '{template_path}'")
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def _load_images(self, frame_paths: List[str]) -> Optional[List[np.ndarray]]:
        """Tải ảnh từ danh sách đường dẫn."""
        # ... (Hàm này không thay đổi)
        images = []
        unique_paths = sorted(list(set(frame_paths)), key=frame_paths.index)
        for path_str in unique_paths:
            p = Path(path_str)  # Không cần thêm .jpg vì đường dẫn đã đầy đủ
            if not p.exists():
                logger.warning(f"  [EventLocalizer] Bỏ qua frame không tồn tại: {p}")
                continue
            try:
                with Image.open(p) as img:
                    images.append(np.array(img.convert("RGB")))
            except Exception as e:
                logger.warning(f"  [EventLocalizer] Không thể mở ảnh {p}: {e}")
        return images if images else None

    def _build_prompt(self, s2t: str, context_text: str) -> str:
        """Tạo prompt chi tiết cho model."""
        # ... (Hàm này không thay đổi)
        s2t_content = s2t if s2t else "Không có giọng nói."
        context_content = (
            context_text
            if context_text
            else "Không có ngữ cảnh bổ sung, tập trung vào các khung hình trong video"
        )
        return self.prompt_template.format(
            s2t=s2t_content, context_text=context_content
        )

    def _parse_json_from_model_output(self, output_text: str) -> Optional[List[Dict]]:
        """Trích xuất và parse khối JSON từ output thô của model."""
        # ... (Hàm này không thay đổi)
        json_pattern = re.search(
            r"```json\s*([\s\S]*?)\s*```|(\[[\s\S]*\]|{[\s\S]*})", output_text
        )
        if not json_pattern:
            logger.warning(
                "  [EventLocalizer] Không tìm thấy khối JSON trong output của model."
            )
            return None
        json_str = json_pattern.group(1) or json_pattern.group(2)
        try:
            json_str_cleaned = json_str.strip().replace("'", '"')
            return json.loads(json_str_cleaned)
        except json.JSONDecodeError:
            logger.error(
                f"  [EventLocalizer] Lỗi khi parse JSON từ chuỗi: {json_str[:200]}..."
            )
            return None

    def localize_events_in_shot(
        self, shot_data: Dict[str, Any], context_text: str
    ) -> Optional[Dict[str, Any]]:
        """
        Phương thức chính để xử lý một shot duy nhất, gọi đến lớp Qwen25VL chung.
        """
        frames = shot_data.get("frames", [])
        if not frames:
            logger.warning("  [EventLocalizer] Shot không có danh sách frames, bỏ qua.")
            return None

        images = self._load_images(frames)
        if not images:
            logger.error(
                "  [EventLocalizer] Không thể tải bất kỳ frame nào, không thể xử lý."
            )
            return None

        # Chuẩn bị đầu vào cho model
        video_data = np.stack(images)
        s2t = shot_data.get("s2t", "")
        prompt = self._build_prompt(s2t=s2t, context_text=context_text)

        # >>> THAY ĐỔI 3: Xây dựng payload và gọi hàm `infer` của lớp chung
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "video", "video": video_data},
                    {"type": "text", "text": prompt},
                ],
            }
        ]

        logger.info(
            f"  [EventLocalizer] Gửi yêu cầu ({len(images)} frame) đến lớp Qwen25VL dùng chung..."
        )
        raw_output_text = self.qwen_model.infer(messages)

        # Xử lý output như cũ
        parsed_json = self._parse_json_from_model_output(raw_output_text)

        return {
            "localized_events": parsed_json,
            "model_raw_output": raw_output_text,
            "context_provided": context_text,
        }
