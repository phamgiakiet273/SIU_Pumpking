# file: event_localizer.py

import json
import logging
import re
from pathlib import Path
from typing import List, Optional, Dict, Any

import numpy as np
import torch
from PIL import Image
from transformers import AutoProcessor, Qwen2_5_VLForConditionalGeneration

# ==============================================================================
# HELPER FUNCTION
# ==============================================================================


def sample_frames_evenly(frame_paths: List[str], max_frames: int = 40) -> List[str]:
    """
    Chọn mẫu các frame một cách "đều" và có ý nghĩa từ danh sách.
    """
    if not frame_paths:
        return []

    unique_paths = sorted(list(set(frame_paths)), key=frame_paths.index)
    n = len(unique_paths)

    if n <= max_frames:
        return unique_paths

    indices_to_keep = {0, n - 1}
    num_middle_frames = max_frames - 2

    if num_middle_frames > 0:
        middle_indices = np.linspace(1, n - 2, num=num_middle_frames, dtype=int)
        indices_to_keep.update(middle_indices)

    sorted_indices = sorted(list(indices_to_keep))
    return [unique_paths[i] for i in sorted_indices]


# ==============================================================================
# MAIN CLASS
# ==============================================================================


class EventLocalizer:
    """
    Sử dụng model Qwen2.5-VL để xác định và khoanh vùng các sự kiện trong một
    phân cảnh video (shot), dựa trên hình ảnh, âm thanh (S2T) và ngữ cảnh văn bản.
    """

    def __init__(self, model_path: str):
        """
        Khởi tạo EventLocalizer bằng cách tải model và processor.
        """
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logging.info(f"🚀 [EventLocalizer] Khởi tạo model trên device: {self.device}")

        try:
            self.model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
                model_path,
                torch_dtype=torch.float16,  # torch_dtype=torch.float16,
                device_map="auto",
            )
            self.processor = AutoProcessor.from_pretrained(model_path)
            logging.info("✅ [EventLocalizer] Model và processor đã sẵn sàng.")
        except Exception as e:
            logging.critical(
                f"❌ [EventLocalizer] Lỗi nghiêm trọng khi tải model: {e}", exc_info=True
            )
            raise

    def _load_images(self, frame_paths: List[str]) -> Optional[List[np.ndarray]]:
        """Tải ảnh từ danh sách đường dẫn và chuyển thành list các numpy array."""
        images = []

        for path_str in frame_paths:
            p = Path(path_str).with_suffix(".jpg")
            if not p.exists():
                logging.warning(f"  [EventLocalizer] Bỏ qua frame không tồn tại: {p}")
                continue
            try:
                with Image.open(p) as img:
                    images.append(np.array(img.convert("RGB")))
            except Exception as e:
                logging.warning(f"  [EventLocalizer] Không thể mở ảnh {p}: {e}")

        return images if images else None

    def _build_prompt(self, s2t: str, context_text: str) -> str:
        """Tạo prompt chi tiết cho model."""
        return f"""Bạn là một chuyên gia phân tích video. Nhiệm vụ của bạn là xác định và phân đoạn các sự kiện riêng biệt trong một video clip.
                **Dữ liệu cung cấp:**
                1. **Keyframes:** Một chuỗi các khung hình đại diện cho video.
                2. **S2T (Speech-to-Text):** Văn bản được nhận dạng từ giọng nói trong video.
                    <s2t>
                    {s2t if s2t else "Không có giọng nói."}
                    </s2t>
                3. **Ngữ cảnh:** Thông tin bổ sung về sự kiện chính có trong video.
                    <context>
                    {context_text if context_text else "Không có ngữ cảnh bổ sung, tập trung vào các khug hình trong video"}
                    </context>

                **Yêu cầu:**
                1. **Phân tích Kỹ lưỡng:** Kết hợp thông tin từ HÌNH ẢNH, S2T, và NGỮ CẢNH để đưa ra kết quả chính xác nhất.
                2. **Phân đoạn Sự kiện:** Chia video thành các sự kiện riêng biệt. Với mỗi sự kiện, cung cấp:
                    - "start": Thời điểm bắt đầu sự kiện (định dạng "mm:ss.ff").
                    - "end": Thời điểm kết thúc sự kiện (định dạng "mm:ss.ff").
                    - "description": Mô tả hành động chính của sự kiện. **Quan trọng: Trong mô tả này, hãy trích xuất và ghi lại TOÀN BỘ văn bản (OCR) mà bạn nhìn thấy** trong các khung hình thuộc sự kiện đó. Bao gồm tiêu đề, tên người, dòng chữ chạy, và bất kỳ ký tự nào khác để diễn đạt ngữ cảnh.
                3. **Tránh Suy diễn:** Tuyệt đối không tự ý thêm thông tin không có trong dữ liệu được cung cấp.
                4. **Định dạng Output:** Chỉ trả về một mảng JSON hợp lệ. KHÔNG thêm bất kỳ giải thích hay văn bản nào khác ngoài khối JSON.
                """

    def _parse_json_from_model_output(self, output_text: str) -> Optional[List[Dict]]:
        """
        Trích xuất và parse khối JSON từ output thô của model một cách an toàn.
        """
        json_pattern = re.search(
            r"```json\s*([\s\S]*?)\s*```|(\[[\s\S]*\]|{[\s\S]*})", output_text
        )
        if not json_pattern:
            logging.warning(
                "  [EventLocalizer] Không tìm thấy khối JSON trong output của model."
            )
            return None

        json_str = json_pattern.group(1) or json_pattern.group(2)
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            logging.error(
                f"  [EventLocalizer] Lỗi khi parse JSON từ chuỗi: {json_str[:200]}..."
            )
            return None

    def localize_events_in_shot(
        self, shot_data: Dict[str, Any], context_text: str, max_frames: int = 45
    ) -> Optional[Dict[str, Any]]:
        """
        Phương thức chính để xử lý một shot duy nhất.
        """
        try:
            frames = shot_data.get("frames", [])
            if not frames:
                logging.warning(
                    "  [EventLocalizer] Shot không có danh sách frames, bỏ qua."
                )
                return None

            selected_frames = sample_frames_evenly(frames, max_frames)
            images = self._load_images(selected_frames)
            if not images:
                logging.error(
                    "  [EventLocalizer] Không thể tải bất kỳ frame nào, không thể xử lý."
                )
                return None

            video_data = np.stack(images)
            s2t = shot_data.get("s2t", "")
            prompt = self._build_prompt(s2t=s2t, context_text=context_text)

            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "video", "video": video_data},
                        {"type": "text", "text": prompt},
                    ],
                }
            ]
            text_prompt = self.processor.apply_chat_template(
                messages, tokenize=False, add_generation_prompt=True
            )
            inputs = self.processor(
                text=[text_prompt],
                videos=[video_data],
                padding=True,
                return_tensors="pt",
            ).to(self.device)

            logging.info(
                f"  [EventLocalizer] Đang xử lý {len(images)} frame trên model..."
            )
            with torch.no_grad():
                generated_ids = self.model.generate(
                    **inputs, max_new_tokens=32768, do_sample=False
                )

            output_ids = generated_ids[0][len(inputs.input_ids[0]) :]
            raw_output_text = self.processor.decode(
                output_ids, skip_special_tokens=True
            ).strip()

            parsed_json = self._parse_json_from_model_output(raw_output_text)

            return {
                "localized_events": parsed_json,
                "model_raw_output": raw_output_text,
                "context_provided": context_text,
            }

        except Exception as e:
            logging.error(
                f"❌ [EventLocalizer] Gặp lỗi không mong muốn khi xử lý shot: {e}",
                exc_info=True,
            )
            return None
