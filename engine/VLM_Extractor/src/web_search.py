# file: web_search.py
import sys

sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking")

import re
import os
import dotenv
import json
import time
from urllib.parse import urlparse
import requests
from googlesearch import search
from rank_bm25 import BM25Okapi
import trafilatura
from urllib3.exceptions import HTTPError
from utils.logger import get_logger

logger = get_logger()

# Import từ các file chúng ta vừa tạo
from engine.VLM_Extractor.utils.list_web import VIET_NEWS_SITES
from engine.VLM_Extractor.utils.utils import remove_diacritics

dotenv.load_dotenv()

BASE_OUTPUT_CRAW_PATH = os.getenv("BASE_OUTPUT_CRAW_PATH")
METADATA_JSION_PATH = os.getenv("METADATA_JSION_PATH")


class Search_web:
    """
    Tự động tìm kiếm, cào, làm sạch và lưu trữ nội dung từ các trang tin tức của Việt Nam
    dựa trên một truy vấn và thông tin từ file metadata (tùy chọn).
    """

    def __init__(
        self,
        query,
        output_dir=BASE_OUTPUT_CRAW_PATH,
        metadata_path=METADATA_JSION_PATH,
        shot_index=1,
    ):
        self.query = query
        self.output_dir = output_dir
        self.metadata_path = metadata_path
        self.shot_index = shot_index
        self.candidate_urls = []
        self.best_url = None

    def _get_year_from_metadata(self) -> str | None:
        """
        Đọc file metadata và trích xuất năm từ 'publish_date'.
        Hàm này có thể xử lý đầu vào là đường dẫn đến file hoặc thư mục.
        """
        if not self.metadata_path or not os.path.exists(self.metadata_path):
            logger.info("   [INFO] Đường dẫn metadata không tồn tại.")
            return None

        json_file_path = None

        # --- LOGIC NÂNG CẤP ---
        # 1. Kiểm tra xem đường dẫn là thư mục hay file
        if os.path.isdir(self.metadata_path):
            logger.info(
                f"   [INFO] Đường dẫn metadata là một thư mục. Đang tìm file .json đầu tiên..."
            )
            # Lặp qua các file trong thư mục để tìm file .json đầu tiên
            for filename in os.listdir(self.metadata_path):
                if filename.endswith(".json"):
                    json_file_path = os.path.join(self.metadata_path, filename)
                    logger.info(
                        f"   [INFO] Đã tìm thấy file metadata: {json_file_path}"
                    )
                    break  # Dừng lại ngay khi tìm thấy file đầu tiên

        elif os.path.isfile(self.metadata_path):
            # Nếu đường dẫn đã là một file thì dùng luôn
            json_file_path = self.metadata_path
        # ----------------------

        # Nếu không tìm được file json nào hợp lệ
        if not json_file_path:
            logger.warning(
                f"   [LỖI] Không tìm thấy file .json nào trong thư mục: {self.metadata_path}"
            )
            return None

        # 2. Đọc nội dung từ file json đã được xác định
        try:
            with open(json_file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            publish_date = data.get("publish_date")
            if publish_date and isinstance(publish_date, str):
                year = publish_date.split("/")[-1]
                if year.isdigit() and len(year) == 4:
                    logger.info(
                        f"   [INFO] Áp dụng bộ lọc thời gian cho năm {year} từ metadata."
                    )
                    return year
        except Exception as e:
            logger.warning(
                f"   [LỖI] Không thể đọc hoặc xử lý file '{json_file_path}': {e}"
            )

        return None

    def _find_candidate_urls(self, num_results=10, max_retries=3):
        """Tìm kiếm Google, lọc URL, và thử lại nếu bị chặn IP."""
        logger.info("--- BƯỚC 1: TÌM KIẾM VÀ LỌC URL ---")
        year = self._get_year_from_metadata()
        search_query = f'"{self.query}"'
        if year:
            search_query += f" năm: {year}"  # Tối ưu truy vấn Google

        logger.info(f"   [INFO] Đang thực hiện truy vấn: {search_query}")

        for attempt in range(max_retries):
            try:
                search_results = search(
                    search_query, num_results=num_results, lang="vi"
                )
                self.candidate_urls = [
                    url
                    for url in search_results
                    if any(site in urlparse(url).netloc for site in VIET_NEWS_SITES)
                ]

                if not self.candidate_urls:
                    logger.warning(
                        "   [KẾT QUẢ] Không tìm thấy URL nào phù hợp từ các trang tin tức được chỉ định."
                    )
                    return False

                logger.info(
                    f"   [KẾT QUẢ] Tìm thấy {len(self.candidate_urls)} URL ứng viên tiềm năng."
                )
                return True

            except HTTPError as e:
                if "429" in str(e):
                    logger.warning(
                        f"   [CẢNH BÁO] Bị chặn IP (Lỗi 429). Đang đợi 2 giây để thử lại... (Lần {attempt + 1}/{max_retries})"
                    )
                    time.sleep(2)
                else:
                    logger.error(
                        f"   [LỖI] Lỗi HTTP không xác định trong quá trình tìm kiếm: {e}"
                    )
                    return False
            except Exception as e:
                logger.error(
                    f"   [LỖI] Đã xảy ra lỗi trong quá trình tìm kiếm Google: {e}"
                )
                return False

        logger.error(
            f"   [LỖI] Tìm kiếm thất bại sau {max_retries} lần thử. Vui lòng kiểm tra kết nối hoặc IP."
        )
        return False

    def _rank_and_select_best_url(self):
        """Dùng BM25 để xếp hạng và chọn URL tốt nhất dựa trên truy vấn."""
        logger.info("\n--- BƯỚC 2: XẾP HẠNG VÀ CHỌN URL TỐT NHẤT ---")
        if not self.candidate_urls:
            return False

        logger.info("   [DEBUG] Các URL ứng viên tìm thấy:")
        for url in self.candidate_urls:
            logger.info(f"     - {url}")

        # --- THAY ĐỔI QUAN TRỌNG Ở ĐÂY ---
        # Tách cả URL và query thành các từ đơn lẻ một cách nhất quán
        # re.split sẽ cắt chuỗi tại bất kỳ ký tự nào không phải chữ cái hoặc số (a-z, 0-9)
        tokenized_corpus = [
            re.split(r"[^a-z0-9]+", remove_diacritics(url))
            for url in self.candidate_urls
        ]
        tokenized_query = re.split(r"[^a-z0-9]+", remove_diacritics(self.query))
        # ------------------------------------

        try:
            bm25 = BM25Okapi(tokenized_corpus)
            doc_scores = bm25.get_scores(tokenized_query)
            best_doc_index = doc_scores.argmax()
            self.best_url = self.candidate_urls[best_doc_index]

            # In ra tất cả các điểm để debug
            logger.info(f"   [DEBUG] Điểm BM25 cho các URL: {doc_scores}")

            logger.info(
                f"   [KẾT QUẢ] URL tốt nhất được chọn (điểm BM25: {doc_scores[best_doc_index]:.2f}):"
            )
            logger.info(f"   -> {self.best_url}")
            return True
        except Exception as e:
            logger.error(f"   [LỖI] Đã xảy ra lỗi trong quá trình xếp hạng BM25: {e}")
            return False

    def _crawl_clean_and_save(self):
        """Tải, làm sạch và lưu nội dung từ URL đã chọn."""
        logger.info("\n--- BƯỚC 3: CÀO, LÀM SẠCH VÀ LƯU NỘI DUNG ---")
        os.makedirs(self.output_dir, exist_ok=True)

        filename = (
            f"output_{self.shot_index}.txt"
            if self.shot_index is not None
            else "output.txt"
        )
        output_file = os.path.join(self.output_dir, filename)

        logger.info(f"   [INFO] Đang xử lý URL: {self.best_url}")

        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
            }
            response = requests.get(
                self.best_url, headers=headers, timeout=20, verify=False
            )  # Thêm verify=False để bỏ qua lỗi SSL
            response.raise_for_status()

            # Sử dụng Trafilatura để trích xuất nội dung chính
            cleaned_content = trafilatura.extract(
                response.text,
                favor_recall=True,
                include_comments=False,
                include_tables=False,
            )

            if cleaned_content:
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(cleaned_content)
                logger.info(
                    f"   [THÀNH CÔNG] Đã lưu nội dung sạch vào file: '{output_file}'"
                )
                return cleaned_content
            else:
                logger.warning(
                    "   [LỖI] Trafilatura không trích xuất được nội dung chính."
                )
                return None

        except Exception as e:
            logger.error(f"   [LỖI] Đã xảy ra lỗi trong quá trình cào và lưu file: {e}")
            return None

    def run(self):
        """
        Thực thi toàn bộ pipeline theo một luồng logic rõ ràng.
        """
        logger.info("\n================= BẮT ĐẦU PIPELINE =================")

        if not self._find_candidate_urls():
            logger.error("Pipeline dừng lại vì không tìm thấy URL ứng viên.")
            return None

        if not self._rank_and_select_best_url():
            logger.error("Pipeline dừng lại vì không thể xếp hạng hoặc chọn URL.")
            return None

        content = self._crawl_clean_and_save()

        logger.info("\n================= KẾT THÚC PIPELINE =================\n")
        return content
