# file: context_extractor.py (phiên bản cuối cùng, đã sửa lỗi)

import os
import logging
from LLM_sumuray import QwenChatModel


class ContextExtractor:
    def __init__(self, base_dir, model_object=None, model_path=None):
        """
        base_dir: Thư mục chứa các file output crawl.
        model_object: (Tùy chọn) Đối tượng model đã được tải sẵn.
        model_path: (Tùy chọn) Đường dẫn model Qwen.
        """
        self.base_dir = base_dir
        # Ưu tiên dùng model đã tải sẵn, nếu không có thì mới tự tải
        if model_object:
            self.qwen = model_object
        else:
            self.qwen = (
                QwenChatModel(model_path=model_path) if model_path else QwenChatModel()
            )

    def _read_all_context(self):
        """Đọc tất cả các file output trong thư mục."""
        context_parts = []
        # os.walk sẽ duyệt qua thư mục base_dir và các thư mục con của nó
        for root, _, files in os.walk(self.base_dir):
            for file in files:
                if file.startswith("output_") and file.endswith(".txt"):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read().strip()
                            if content:
                                context_parts.append(content)
                    except Exception as e:
                        logging.warning(f"Không thể đọc {file_path}: {e}")
        return "\n\n".join(context_parts)

    def extract(self):
        """Ghép context và gửi Qwen để trích xuất thông tin."""
        context_text = self._read_all_context()
        if not context_text:
            logging.error("❌ Không tìm thấy context trong các file output.")
            return None

        prompt = f"""Bạn là hệ thống trích xuất thông tin.
Dựa trên nội dung dưới đây, hãy liệt kê đầy đủ tất cả các thông tin và chi tiết quan trọng nhất.

Nội dung:
{context_text}

Yêu cầu:
- Xác định sự kiện hoặc chủ đề chính.
- Nêu rõ các nhân vật, tổ chức, đội nhóm, hoặc đối tượng liên quan.
- Mô tả các đặc điểm nhận dạng quan trọng (ví dụ: màu áo, số áo, phương tiện, vật dụng).
- Nêu thời gian, địa điểm nếu có.
- Bao gồm diễn biến, kết quả hoặc thông tin then chốt khác.
- Trình bày ngắn gọn, rõ ràng, dạng liệt kê hoặc gạch đầu dòng.
- Không thêm nhận xét hoặc suy luận ngoài nội dung.

Chỉ trả về danh sách thông tin, không giải thích thêm."""

        thinking, response = self.qwen.generate_response(prompt)
        logging.debug("🧠 Thinking Content:\n" + thinking)
        return response
