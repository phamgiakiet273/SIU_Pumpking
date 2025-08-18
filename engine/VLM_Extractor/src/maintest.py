# file: main.py

import sys
import os
import dotenv
import torch
from pprint import pprint
import json

# --- SETUP MÔI TRƯỜNG ---
PROJECT_ROOT = "/workspace/competitions/AIC_2025/SIU_Pumpking"
sys.path.append(PROJECT_ROOT)
dotenv.load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

# --- Import các lớp xử lý và tiện ích ---
from engine.VLM_Extractor.src.title_extractor import TitleExtractor
from engine.VLM_Extractor.src.web_search import Search_web
from engine.VLM_Extractor.src.context_extractor import ContextExtractor
from engine.VLM_Extractor.llm_model.qwen3.qwen3 import QwenChatModel
from engine.VLM_Extractor.src.caption import EventLocalizer
from utils.logger import get_logger

# --- CẤU HÌNH ---
logger = get_logger()
INPUT_ROOT_DIR = os.path.join(PROJECT_ROOT, "engine/VLM_Extractor/src/output")


class MainWorkflow:
    """
    Lớp điều phối chính...
    """

    def __init__(self):
        logger.info("✅ Workflow đã được khởi tạo (chưa tải model).")

    def execute_step_1_title(self, frame_paths: list) -> str:
        """
        Bước 1: Tải model, trích xuất tiêu đề, và giải phóng model.
        """
        logger.info("🚀 [Bước 1] Đang tải mô hình TitleExtractor...")
        title = None
        try:
            title_extractor = TitleExtractor()
            title = title_extractor.extract_from_paths(frame_paths)
        finally:
            del title_extractor
            torch.cuda.empty_cache()
            logger.info("🧹 [Bước 1] Đã giải phóng bộ nhớ của TitleExtractor.")
        return title

    def execute_step_2_web_search(self, title: str, shot_index: int) -> str:
        """
        Bước 2: Tìm kiếm web dựa trên tiêu đề.
        """
        logger.info("🚀 [Bước 2] Đang tìm kiếm web...")
        web_search_pipeline = Search_web(query=title, shot_index=shot_index)
        content = web_search_pipeline.run()
        return content

    def execute_step_3_summary(self, content: str) -> str:
        """
        Bước 3: Tải model, tóm tắt nội dung, và giải phóng model.
        """
        if not content:
            logger.warning("🟡 [Bước 3] Bỏ qua vì không có nội dung web.")
            return ""  # Trả về chuỗi rỗng thay vì None

        logger.info("🚀 [Bước 3] Đang tải mô hình ContextExtractor...")
        summary = ""
        try:
            qwen_model = QwenChatModel()
            context_extractor = ContextExtractor(model_object=qwen_model)
            summary = context_extractor.extract(content)
        finally:
            del qwen_model
            del context_extractor
            torch.cuda.empty_cache()
            logger.info("🧹 [Bước 3] Đã giải phóng bộ nhớ của ContextExtractor.")
        return summary

    def execute_step_4_caption(self, frame_paths: list, context_text: str) -> dict:
        """
        Bước 4: Tải model, tạo caption cho shot, và giải phóng model.
        """
        # >>> THAY ĐỔI: Xóa câu lệnh kiểm tra `if not context_text` ở đây
        # Bước này sẽ luôn chạy, kể cả khi context_text là chuỗi rỗng.

        logger.info("🚀 [Bước 4] Đang tải mô hình EventLocalizer (Caption)...")
        if not context_text:
            logger.warning(
                "🟡 [Bước 4] Không có ngữ cảnh (summary), sẽ tạo caption chỉ dựa trên hình ảnh."
            )

        caption_result = None
        try:
            event_localizer = EventLocalizer()
            shot_data = {"frames": frame_paths, "s2t": ""}

            result_dict = event_localizer.localize_events_in_shot(
                shot_data=shot_data, context_text=context_text
            )
            if result_dict:
                caption_result = result_dict.get("localized_events")

        except Exception as e:
            logger.error(
                f"❌ [Bước 4] Lỗi trong quá trình tạo caption: {e}", exc_info=True
            )
        finally:
            if "event_localizer" in locals():
                del event_localizer
            torch.cuda.empty_cache()
            logger.info("🧹 [Bước 4] Đã giải phóng bộ nhớ của EventLocalizer.")

        return caption_result


if __name__ == "__main__":
    logger.info("================ CHƯƠNG TRÌNH BẮT ĐẦU ================")
    workflow = MainWorkflow()

    if not os.path.isdir(INPUT_ROOT_DIR):
        logger.error(f"❌ Lỗi: Thư mục input '{INPUT_ROOT_DIR}' không tồn tại.")
        sys.exit(1)

    shot_dirs = sorted(
        [
            d
            for d in os.listdir(INPUT_ROOT_DIR)
            if os.path.isdir(os.path.join(INPUT_ROOT_DIR, d))
        ]
    )
    if not shot_dirs:
        logger.warning(f"🟡 Không tìm thấy thư mục shot nào trong '{INPUT_ROOT_DIR}'.")

    for idx, shot_dir_name in enumerate(shot_dirs):
        shot_index = idx + 1
        shot_dir_path = os.path.join(INPUT_ROOT_DIR, shot_dir_name)

        logger.info(
            f"\n{'='*20} XỬ LÝ SHOT {shot_index}/{len(shot_dirs)}: {shot_dir_name} {'='*20}"
        )

        frame_paths = [
            os.path.join(shot_dir_path, f)
            for f in sorted(os.listdir(shot_dir_path))
            if f.lower().endswith((".png", ".jpg", ".jpeg"))
        ]

        if not frame_paths:
            logger.warning(
                f"🟡 Thư mục shot {shot_dir_name} không chứa file ảnh nào. Bỏ qua."
            )
            continue

        logger.info(f"Tìm thấy {len(frame_paths)} frame cho shot {shot_index}.")

        # --- Thực thi quy trình theo từng bước ---

        # BƯỚC 1: Lấy tiêu đề
        title = workflow.execute_step_1_title(frame_paths)
        if not title or "lỗi" in title.lower():
            logger.error(
                f"❌ Dừng xử lý shot {shot_index} vì không thể trích xuất tiêu đề. Kết quả: '{title}'"
            )
            continue
        logger.info(f"✅ [Bước 1] Tiêu đề trích xuất được: '{title}'")

        # BƯỚC 2: Tìm kiếm nội dung web
        content = workflow.execute_step_2_web_search(title, shot_index)
        if not content:
            logger.warning(f"🟡 Không tìm thấy nội dung web cho shot {shot_index}.")
        else:
            logger.info(f"✅ [Bước 2] Đã tìm thấy nội dung web.")

        # BƯỚC 3: Tóm tắt nội dung
        summary = workflow.execute_step_3_summary(content)
        if not summary:
            logger.warning(f"🟡 Không thể tóm tắt nội dung web cho shot {shot_index}.")
        else:
            logger.info(f"✅ [Bước 3] Đã tóm tắt thành công nội dung.")

        # >>> THAY ĐỔI LOGIC CHÍNH Ở ĐÂY <<<
        # Luôn gọi bước 4. Nếu summary không có, nó sẽ là một chuỗi rỗng.
        # Điều này đảm bảo caption luôn được tạo, dù chỉ dựa trên hình ảnh.
        logger.info("🚀 Bắt đầu Bước 4: Tạo Caption...")
        caption = workflow.execute_step_4_caption(
            frame_paths, context_text=summary or ""
        )

        if caption:
            logger.info(f"✅ [Bước 4] Đã tạo thành công caption.")
        else:
            logger.warning(f"🟡 Không thể tạo caption cho shot {shot_index}.")

        # --- In kết quả cuối cùng của shot này ra màn hình ---
        print("\n" + "=" * 80)
        print(f"                       KẾT QUẢ CUỐI CÙNG CHO SHOT {shot_index}")
        print("=" * 80)
        print(f"📄 TIÊU ĐỀ:\n   {title}")
        print("-" * 80)
        print("📖 NỘI DUNG WEB (tóm tắt):")
        # Sử dụng `summary or "   Không có."` để in đẹp hơn
        pprint(summary, indent=3) if summary else print("   Không có.")
        print("-" * 80)
        print("📝 CAPTION SỰ KIỆN (từ video & tóm tắt):")
        pprint(caption, indent=3) if caption else print("   Không có.")
        print("=" * 80 + "\n")

        if caption:
            final_output_dir = os.path.join(
                PROJECT_ROOT, "engine/VLM_Extractor/final_results"
            )
            os.makedirs(final_output_dir, exist_ok=True)

            json_output_path = os.path.join(
                final_output_dir, f"caption_shot_{shot_index}.json"
            )

            try:
                with open(json_output_path, "w", encoding="utf-8") as f:
                    json.dump(caption, f, ensure_ascii=False, indent=4)
                logger.info(f"✅ Đã lưu thành công kết quả JSON vào: {json_output_path}")
            except Exception as e:
                logger.error(f"❌ Lỗi khi lưu file JSON: {e}")

    logger.info("================== CHƯƠNG TRÌNH KẾT THÚC ==================")
