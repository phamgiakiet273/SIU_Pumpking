# file: title_extractor.py
import logging
import torch
import numpy as np
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
from transformers import (
    Qwen2_5_VLForConditionalGeneration,
    AutoProcessor,
    BitsAndBytesConfig,
)


class TitleExtractor:
    """
    Một lớp để tải mô hình Qwen2.5-VL và trích xuất tiêu đề từ các frame ảnh.
    """

    def __init__(self, model_path: str):
        logging.info("🚀 [TitleExtractor] Đang khởi tạo...")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model, self.processor = self._load_model(model_path)
        logging.info("✅ [TitleExtractor] Đối tượng đã sẵn sàng.")

    def _load_model(self, model_path: str):
        logging.info(f"🧠 [TitleExtractor] Đang tải mô hình từ: {model_path}")
        quantization_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.float16,
        )
        model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
            model_path,
            quantization_config=quantization_config,
            torch_dtype=torch.float16,
            device_map="auto",
        )
        processor = AutoProcessor.from_pretrained(model_path)
        return model, processor

    def _load_frames_parallel(self, frame_paths: list, max_workers: int = 16):
        def _load_single_frame(path: str):
            try:
                return np.array(Image.open(f"{path}.jpg").convert("RGB"))
            except Exception:
                return None

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            results = executor.map(_load_single_frame, frame_paths)
            loaded_frames = [frame for frame in results if frame is not None]

        return np.stack(loaded_frames) if loaded_frames else None

    def extract_title(self, frame_paths: list) -> str:
        if not frame_paths:
            return "Lỗi: Danh sách frame rỗng."

        logging.info(f"🖼️  [TitleExtractor] Đang tải {len(frame_paths)} khung hình...")
        loaded_frames = self._load_frames_parallel(frame_paths)
        if loaded_frames is None:
            return "Lỗi: Không thể tải được frames."

        user_prompt = "Các khung hình này được trích từ phần đầu của một bản tin thời sự. Hãy quét kỹ các khung hình để tìm và trích xuất chính xác văn bản của tiêu đề chính. Chỉ trả về nội dung văn bản của tiêu đề."
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "video", "video": loaded_frames},
                    {"type": "text", "text": user_prompt},
                ],
            }
        ]
        text_prompt = self.processor.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        inputs = self.processor(
            text=[text_prompt],
            videos=[loaded_frames],
            padding=True,
            return_tensors="pt",
        ).to(self.model.device)

        logging.info("🧠 [TitleExtractor] Đang suy luận...")
        generated_ids = self.model.generate(**inputs, max_new_tokens=120)
        generated_ids_trimmed = [
            out_ids[len(in_ids) :]
            for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
        ]
        output_text = self.processor.batch_decode(
            generated_ids_trimmed,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=False,
        )[0]

        return output_text.strip()
