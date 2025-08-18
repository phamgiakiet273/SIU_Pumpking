# file: qwen25vl.py

import os
import dotenv
import torch
from transformers import Qwen2_5_VLForConditionalGeneration, AutoProcessor
from typing import List, Dict, Any
from utils.logger import get_logger

# Tải biến môi trường và thiết lập môi trường
dotenv.load_dotenv()
# os.environ["CUDA_VISIBLE_DEVICES"] = os.getenv("QWEN25_CUDA_VISIBLE_DEVICES")
Model_path = os.getenv("MODEL_QWEN25_WEIGHT_FOLDER")
logger = get_logger()


class Qwen25VL:
    """
    Lớp lõi để tải và chạy suy luận với mô hình Qwen2.5-VL.
    Lớp này không biết về logic nghiệp vụ cụ thể, chỉ tập trung vào mô hình.
    """

    def __init__(self, model_path: str = None):
        if model_path is None:
            model_path = Model_path
        if not model_path:
            raise ValueError("MODEL_QWEN25_WEIGHT_FOLDER chưa được set trong .env")

        self.model_path = model_path
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(
            f"🚀 [Qwen25VL] Khởi tạo mô hình '{self.model_path}' trên {self.device}..."
        )

        try:
            self.model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
                self.model_path, torch_dtype="auto", device_map="auto"
            )
            self.processor = AutoProcessor.from_pretrained(self.model_path)
            logger.info("✅ [Qwen25VL] Mô hình và bộ xử lý đã sẵn sàng.")
        except Exception as e:
            logger.critical(
                f"❌ [Qwen25VL] Lỗi nghiêm trọng khi tải mô hình: {e}", exc_info=True
            )
            raise

    def infer(self, messages: List[Dict[str, Any]], max_new_tokens: int = 1024) -> str:
        """
        Thực hiện suy luận chung trên mô hình với một payload tin nhắn.
        """
        try:
            # Chuẩn bị prompt và video/ảnh từ `messages`
            text_prompt = self.processor.apply_chat_template(
                messages, tokenize=False, add_generation_prompt=True
            )
            videos = [
                content_item["video"]
                for message in messages
                if message["role"] == "user"
                for content_item in message["content"]
                if content_item["type"] == "video"
            ]

            inputs = self.processor(
                text=[text_prompt], videos=videos, padding=True, return_tensors="pt"
            ).to(self.device)

            # Thực hiện suy luận
            with torch.no_grad():
                generated_ids = self.model.generate(
                    **inputs,
                    max_new_tokens=max_new_tokens,
                    do_sample=True,
                    temperature=0.7,
                )

            # Giải mã kết quả
            output_ids = generated_ids[0][len(inputs["input_ids"][0]) :]
            response = self.processor.decode(
                output_ids, skip_special_tokens=True
            ).strip()
            return response

        except Exception as e:
            logger.error(
                f"❌ [Qwen25VL] Quá trình suy luận thất bại: {e}", exc_info=True
            )
            return "Lỗi: Quá trình suy luận thất bại."
