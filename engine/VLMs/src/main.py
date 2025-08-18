# file: main.py
import os
import json
import logging
from title_extractor import TitleExtractor
from context_web import NewsPipeline
from context_extractor import ContextExtractor
from event_localizer import EventLocalizer


def setup_logging(log_dir):
    """Cấu hình logging."""
    os.makedirs(log_dir, exist_ok=True)
    log_file_path = os.path.join(log_dir, "pipeline_main.log")

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler(log_file_path, mode="w", encoding="utf-8"),
            logging.StreamHandler(),
        ],
    )
    return log_file_path


def process_single_shot(
    shot_data,
    shot_index,
    config,
    title_extractor,
    context_extractor_model,
    event_localizer,
):
    """
    Xử lý trọn vẹn một shot duy nhất: từ trích xuất tiêu đề đến khoanh vùng sự kiện.
    Các module nặng được truyền vào để tránh tải lại model mỗi lần.
    """
    logging.info(f"{'='*25} BẮT ĐẦU XỬ LÝ SHOT #{shot_index} {'='*25}")

    # ===== BƯỚC 1: TRÍCH XUẤT TIÊU ĐỀ =====
    # Lấy 10 frame đầu để trích xuất tiêu đề
    frames_for_title = shot_data.get("frames", [])[:10]
    if not frames_for_title:
        logging.warning(
            f"Shot #{shot_index}: Không có frame để trích xuất tiêu đề, bỏ qua."
        )
        return None

    extracted_title = title_extractor.extract_title(frames_for_title)
    logging.info(f"Shot #{shot_index} - Tiêu đề trích xuất: {extracted_title}")

    # ===== BƯỚC 2 & 3: CRAWL WEB VÀ TRÍCH XUẤT NGỮ CẢNH RIÊNG =====
    context_text = "Không có ngữ cảnh bổ sung từ web."  # Giá trị mặc định
    if not extracted_title or extracted_title.startswith("Lỗi:"):
        logging.error(
            f"Shot #{shot_index}: Tiêu đề không hợp lệ, sẽ chạy khoanh vùng sự kiện không có ngữ cảnh web."
        )
    else:
        shot_output_dir = os.path.join(config["BASE_OUTPUT_CRAW_PATH"], "class_02")
        base_filename = os.path.basename(config["SHOT_JSON_PATH"])
        metadata_path = os.path.join(config["METADATA_BASE_PATH"], base_filename)

        # 2. Chạy pipeline crawl web cho riêng shot này
        web_pipeline = NewsPipeline(
            query=extracted_title,
            output_dir=shot_output_dir,
            metadata_path=metadata_path,
            shot_index=shot_index,
        )
        web_pipeline.run()

        # 3. Trích xuất ngữ cảnh chỉ từ thư mục của shot này
        # Chú ý: ContextExtractor giờ chỉ nhận đầu vào là shot_output_dir
        context_extractor = ContextExtractor(
            shot_output_dir, model_path=config["SUMMURAY_MODEL"]
        )
        shot_context = context_extractor.extract()

        if shot_context:
            context_text = shot_context
            logging.info(
                f"Shot #{shot_index} - Ngữ cảnh riêng đã trích xuất thành công."
            )
            logging.debug(f"Shot #{shot_index} - Nội dung ngữ cảnh:\n{context_text}")
        else:
            logging.warning(
                f"Shot #{shot_index}: Không trích xuất được context từ web, dù đã crawl."
            )

    # ===== BƯỚC 4: KHOANH VÙNG SỰ KIỆN VỚI NGỮ CẢNH ĐÚNG =====
    logging.info(
        f"Shot #{shot_index}: Bắt đầu khoanh vùng sự kiện với ngữ cảnh đã xử lý."
    )
    # Điều chỉnh hàm EventLocalizer.run để nó có thể chỉ xử lý một shot
    # Ở đây ta sẽ truyền toàn bộ dữ liệu của shot vào thay vì chỉ index
    shot_localization_result = event_localizer.localize_events_in_shot(
        shot_data=shot_data, context_text=context_text, max_frames=26
    )

    # Thêm thông tin index của shot vào kết quả để tiện theo dõi
    if shot_localization_result:
        shot_localization_result["shot_index"] = shot_index

    logging.info(f"{'='*25} HOÀN TẤT XỬ LÝ SHOT #{shot_index} {'='*25}\n")
    return shot_localization_result


def main():
    """
    Hàm chính điều phối toàn bộ pipeline.
    """
    config = {
        "LOCAL_MODEL_PATH": "/workspace/competitions/NCKH/An/Qwen2.5-VL-3B-Instruct",
        "SUMMURAY_MODEL": "Qwen/Qwen3-1.7B",
        "SHOT_JSON_PATH": "/workspace/nhihtc/perfect/AIC2025/shot/vlm/L01_V001.json",
        "METADATA_BASE_PATH": "/dataset/AIC2024/original_dataset/0/metadata/media-info",
        "BASE_OUTPUT_CRAW_PATH": "/workspace/competitions/AIC_2025/SIU_Pumpking/engine/VLMs/output_crawl",
        "FINAL_RESULTS_PATH": "/workspace/competitions/AIC_2025/SIU_Pumpking/engine/VLMs/event_localization_results_final.json",
    }
    setup_logging(config["BASE_OUTPUT_CRAW_PATH"])
    logging.info("🚀 Bắt đầu pipeline xử lý từng shot độc lập...")

    # ===== KHỞI TẠO CÁC MODEL LỚN MỘT LẦN DUY NHẤT =====
    # Điều này giúp tiết kiệm thời gian và bộ nhớ, không cần tải lại model cho mỗi shot
    try:
        title_extractor = TitleExtractor(model_path=config["LOCAL_MODEL_PATH"])
        # Không cần khởi tạo ContextExtractor ở đây vì nó không tải model nặng
        event_localizer = EventLocalizer(model_path=config["LOCAL_MODEL_PATH"])
        logging.info("✅ Tất cả các model lớn đã được khởi tạo.")
    except Exception as e:
        logging.critical(f"❌ Lỗi nghiêm trọng khi khởi tạo model: {e}", exc_info=True)
        return

    # ===== ĐỌC DỮ LIỆU SHOT =====
    try:
        with open(config["SHOT_JSON_PATH"], "r", encoding="utf-8") as f:
            all_shots_data = json.load(f)
    except Exception as e:
        logging.critical(f"❌ Lỗi nghiêm trọng khi đọc file JSON chính: {e}")
        return

    # ===== LẶP QUA TỪNG SHOT VÀ XỬ LÝ ĐỘC LẬP =====
    final_results = []
    for i, shot_data in enumerate(all_shots_data):
        if shot_data.get("class") == 2:
            # Truyền các model đã khởi tạo vào hàm xử lý
            result = process_single_shot(
                shot_data=shot_data,
                shot_index=i,
                config=config,
                title_extractor=title_extractor,
                context_extractor_model=config[
                    "SUMMURAY_MODEL"
                ],  # chỉ truyền đường dẫn model
                event_localizer=event_localizer,
            )
            if result:
                final_results.append(result)

    # ===== LƯU KẾT QUẢ CUỐI CÙNG =====
    with open(config["FINAL_RESULTS_PATH"], "w", encoding="utf-8") as f:
        json.dump(final_results, f, ensure_ascii=False, indent=2)

    logging.info(
        f"✅✅✅ Pipeline hoàn tất. Toàn bộ {len(final_results)} shot đã được xử lý."
    )
    logging.info(f"Kết quả cuối cùng đã được lưu tại: {config['FINAL_RESULTS_PATH']}")


if __name__ == "__main__":
    main()
