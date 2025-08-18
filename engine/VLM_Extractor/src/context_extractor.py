# file: context_extractor.py

import os
import dotenv
from utils.logger import get_logger

from engine.VLM_Extractor.llm_model.qwen3.qwen3 import QwenChatModel

dotenv.load_dotenv()
logger = get_logger()

PROMPT_PATH = os.getenv("SUMMURAY_PROMPT_PATH")
BASE_OUTPUT_CRAW_PATH = os.getenv("BASE_OUTPUT_CRAW_PATH")


class ContextExtractor:
    def __init__(self, model_object: QwenChatModel):
        """
        Args:
            base_dir (str): Thư mục chứa các file output crawl.
            prompt_path (str): Đường dẫn đến file .txt chứa prompt template.
            model_object (QwenChatModel): Đối tượng model đã được tải sẵn.
        """
        self.base_dir = BASE_OUTPUT_CRAW_PATH
        self.qwen = model_object

        try:
            with open(PROMPT_PATH, "r", encoding="utf-8") as f:
                self.prompt_template = f.read()
            logger.info(f"✅ Đã tải prompt template từ '{PROMPT_PATH}'")
        except FileNotFoundError:
            logger.error(f"❌ Không tìm thấy file prompt tại: {PROMPT_PATH}")
            raise

    def _read_all_context(self) -> str:
        """Đọc tất cả các file output trong thư mục."""
        context_parts = []
        # Logic đọc file không thay đổi, vẫn duyệt qua các thư mục con
        for root, _, files in os.walk(self.base_dir):
            for file in files:
                # Điều kiện tìm file vẫn giữ nguyên
                if file.startswith("output_") and file.endswith(".txt"):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read().strip()
                            if content:
                                context_parts.append(content)
                    except Exception as e:
                        logger.warning(f"Không thể đọc {file_path}: {e}")
        return "\n\n".join(context_parts)

    def extract(self, context_text: str) -> str:
        """Ghép context, gửi Qwen để trích xuất và lưu kết quả."""
        context_text = self._read_all_context()
        if not context_text:
            logger.error("❌ Không tìm thấy context trong các file output.")
            return None

        prompt = self.prompt_template.format(context_text=context_text)

        logger.info("🧠 Đang gửi yêu cầu trích xuất thông tin đến model...")
        thinking, response = self.qwen.generate_response(prompt)
        logger.debug("🤔 Thinking Content:\n" + thinking)

        if response:
            try:
                # Tìm tên file duy nhất trong thư mục gốc (base_dir)
                i = 1
                while True:
                    # Tên file sẽ là sum_1.txt, sum_2.txt,...
                    output_filename = f"sum_{i}.txt"
                    output_filepath = os.path.join(self.base_dir, output_filename)
                    if not os.path.exists(output_filepath):
                        break
                    i += 1

                # Ghi kết quả tóm tắt vào file
                with open(output_filepath, "w", encoding="utf-8") as f:
                    f.write(response)
                logger.info(f"✅ Đã lưu kết quả tóm tắt vào: '{output_filepath}'")

            except Exception as e:
                logger.error(f"❌ Lỗi khi đang lưu file tóm tắt: {e}")

        return response
