# file: context_web.py

import os
import re
import json
import logging
import time
from urllib.parse import urlparse
import requests
from googlesearch import search
from rank_bm25 import BM25Okapi
import trafilatura
from urllib3.exceptions import HTTPError


class NewsPipeline:
    """
    Tự động tìm kiếm, cào, làm sạch và lưu trữ nội dung từ các trang tin tức của Việt Nam
    dựa trên một truy vấn và thông tin từ file metadata (tùy chọn).
    """

    # Danh sách các trang tin tức uy tín của Việt Nam
    VIET_NEWS_SITES = [
        # Báo lớn
        "vov.vn",
        "cand.com.vn",
        "kiemsat.vn",
        "thoibaotaichinhvietnam.vn",
        "tapchitaichinh.vn",
        "thoibaonganhang.vn",
        "tapchinganhang.gov.vn",
        "tapchitoaan.vn",
        "tapchibaohiemxahoi.gov.vn",
        "vietnam.vnanet.vn",
        "thanhtra.com.vn",
        "thanhtravietnam.vn",
        "qdnd.vn",
        "nongnghiep.vn",
        "baovanhoa.vn",
        "vanhoanghethuat.vn",
        "giaoducthoidai.vn",
        "daibieunhandan.vn",
        "vietq.vn",
        "qltt.vn",
        "vtcnews.vn",
        "haiquanonline.com.vn",
        "consosukien.vn",
        "congthuong.vn",
        "toquoc.vn",
        "baophapluat.vn",
        "baodautu.vn",
        "baodauthau.vn",
        "baovephapluat.vn",
        "thuenhanuoc.vn",
        "thethaovanhoa.vn",
        "kinhtevadubao.vn",
        "baogiaothong.vn",
        "tapchigiaothong.vn",
        "ictvietnam.vn",
        "baodantoc.vn",
        "baohaiquanvietnam.vn",
        "dantocmiennui.vn",
        "vietnamplus.vn",
        "tapchicongthuong.vn",
        "baoquocte.vn",
        "vietnamnet.vn",
        "baochinhphu.vn",
        "dantri.com.vn",
        "vnexpress.net",
        "suckhoedoisong.vn",
        "congly.vn",
        "baoxaydung.com.vn",
        "tapchixaydung.vn",
        "tapchigiaoduc.edu.vn",
        "tcnn.vn",
        "tapchikhoahocnongnghiep.vn",
        "baokiemtoan.vn",
        "antoanthongtin.vn",
        "vjst.vn",
        "baotainguyenmoitruong.vn",
        "tainguyenvamoitruong.vn",
        "vtv.vn",
        "daidoanket.vn",
        "laodong.vn",
        "nhandan.vn",
        "dangcongsan.vn",
        "thanhnien.vn",
        "phunuvietnam.vn",
        "kienthuc.net.vn",
        "trithuccuocsong.vn",
        "tienphong.vn",
        "bongdaplus.vn",
        "laodongcongdoan.vn",
        "phunumoi.net.vn",
        "nguoiduatin.vn",
        "diendandoanhnghiep.vn",
        "congnghevadoisong.vn",
        "1thegioi.vn",
        "markettimes.vn",
        "tapchithangmay.vn",
        "taichinhdoanhnghiep.net.vn",
        "vneconomy.vn",
        "arttimes.vn",
        "congluan.vn",
        "thoidai.com.vn",
        "kinhtechungkhoan.vn",
        "nhandaoonline.vn",
        "chatluongvacuocsong.vn",
        "giaoduc.net.vn",
        "mekongasean.vn",
        "znews.vn",
        "thuonghieucongluan.com.vn",
        "tapchinongthonmoi.vn",
        "baovannghe.com.vn",
        "thegioidisan.vn",
        "ngaymoionline.com.vn",
        "petrotimes.vn",
        "thuonggiaonline.vn",
        "kinhdoanhvabienmau.vn",
        "dientungaynay.vn",
        "dientuungdung.vn",
        "doithoaiphattrien.vn",
        "lyluanchinhtrivatruyenthong.vn",
        "thanhnienviet.vn",
        "nghenhinvietnam.vn",
        "vnmedia.vn",
        "vanhienplus.vn",
        "vanhoavaphattrien.vn",
        "phaply.net.vn",
        "phapluatphattrien.vn",
        "nld.com.vn",
        # Đài địa phương
        "atv.org.vn",
        "brt.vn",
        "bacgiangtv.vn",
        "backantv.vn",
        "thbl.vn",
        "bacninhtv.vn",
        "thbt.vn",
        "binhdinhtv.vn",
        "btv.org.vn",
        "bptv.org.vn",
        "binhthuantv.vn",
        "ctvcamau.vn",
        "canthotv.vn",
        "caobangtv.vn",
        "danangtv.vn",
        "daklak.gov.vn",
        "daknong.gov.vn",
        "dienbientv.vn",
        "dnrtv.org.vn",
        "thdt.vn",
        "gialaitv.vn",
        "hagiangtv.vn",
        "hanamtv.vn",
        "hanoionline.vn",
        "hatinhtv.vn",
        "haiduongtv.com.vn",
        "thhp.vn",
        "haugiangtivi.vn",
        "hoabinhtv.vn",
        "hungyentv.vn",
        "ktv.org.vn",
        "kgtv.vn",
        "kontumtv.vn",
        "laichautv.vn",
        "lamdongtv.vn",
        "langsontv.vn",
        "laocaitv.vn",
        "la34.com.vn",
        "namdinhtv.vn",
        "truyenhinhnghean.vn",
        "nbtv.vn",
        "ninhthuantv.vn",
        "phuthotv.vn",
        "ptpphuyen.vn",
        "qbtv.vn",
        "qrt.vn",
        "quangngaitv.vn",
        "qtv.vn",
        "quangtritv.vn",
        "thst.vn",
        "sonlatv.vn",
        "tayninh.gov.vn",
        "thaibinhtv.vn",
        "thainguyentv.vn",
        "truyenhinhthanhhoa.vn",
        "trthue.vn",
        "thtg.vn",
        "htv.com.vn",
        "travinhtv.vn",
        "tuyenquangtv.vn",
        "thvl.vn",
        "vinhphuctv.vn",
        "yenbaitv.org.vn",
    ]

    # <<< THAY ĐỔI 1: SỬA HÀM __INIT__ ĐỂ NHẬN SHOT_INDEX >>>
    def __init__(
        self, query, output_dir="cleaned_articles", metadata_path=None, shot_index=None
    ):
        self.query = query
        self.output_dir = output_dir
        self.metadata_path = metadata_path
        self.shot_index = shot_index  # <-- Thêm dòng này
        self.candidate_urls = []
        self.best_url = None

    def _get_year_from_metadata(self) -> str | None:
        """Đọc file metadata và trích xuất năm từ 'publish_date'."""
        if not self.metadata_path or not os.path.exists(self.metadata_path):
            logging.info("   [INFO] Không có file metadata để lọc theo năm.")
            return None
        try:
            with open(self.metadata_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            publish_date = data.get("publish_date")
            if publish_date and isinstance(publish_date, str):
                year = publish_date.split("/")[-1]
                if year.isdigit() and len(year) == 4:
                    logging.info(
                        f"   [INFO] Áp dụng bộ lọc thời gian cho năm {year} từ metadata."
                    )
                    return year
        except Exception as e:
            logging.warning(f"   [LỖI] Không thể đọc hoặc xử lý file metadata: {e}")
        return None

    def _remove_diacritics(self, text):
        """Hàm trợ giúp để loại bỏ dấu câu khỏi chuỗi tiếng Việt."""
        s = text.lower()
        s = re.sub(r"[àáạảãâầấậẩẫăằắặẳẵ]", "a", s)
        s = re.sub(r"[èéẹẻẽêềếệểễ]", "e", s)
        s = re.sub(r"[ìíịỉĩ]", "i", s)
        s = re.sub(r"[òóọỏõôồốộổỗơờớợởỡ]", "o", s)
        s = re.sub(r"[ùúụủũưừứựửữ]", "u", s)
        s = re.sub(r"[ỳýỵỷỹ]", "y", s)
        s = re.sub(r"[đ]", "d", s)
        return s

    def _find_candidate_urls(self, num_results=10, max_retries=3):
        """Tìm kiếm Google, lọc URL, và thử lại nếu bị chặn IP."""
        logging.info("--- BƯỚC 1: TÌM KIẾM VÀ LỌC URL ---")
        year = self._get_year_from_metadata()
        search_query = f'"{self.query}"'
        if year:
            search_query += f" năm: {year}"

        logging.info(f"   [INFO] Đang thực hiện truy vấn: {search_query}")

        for attempt in range(max_retries):
            try:
                search_results = search(
                    search_query, num_results=num_results, lang="vi"
                )
                self.candidate_urls = [
                    url
                    for url in search_results
                    if any(
                        site in urlparse(url).netloc for site in self.VIET_NEWS_SITES
                    )
                ]

                if not self.candidate_urls:
                    logging.warning(
                        "   [KẾT QUẢ] Không tìm thấy URL nào phù hợp từ các trang tin tức được chỉ định."
                    )
                    return False

                logging.info(
                    f"   [KẾT QUẢ] Tìm thấy {len(self.candidate_urls)} URL ứng viên tiềm năng."
                )
                return True

            except HTTPError as e:
                if "429" in str(e):
                    logging.warning(
                        f"   [CẢNH BÁO] Bị chặn IP (Lỗi 429). Đang đợi 2 giây để thử lại... (Lần {attempt + 1}/{max_retries})"
                    )
                    time.sleep(2)
                else:
                    logging.error(
                        f"   [LỖI] Lỗi HTTP không xác định trong quá trình tìm kiếm: {e}"
                    )
                    return False
            except Exception as e:
                logging.error(
                    f"   [LỖI] Đã xảy ra lỗi trong quá trình tìm kiếm Google: {e}"
                )
                return False

        logging.error(
            f"   [LỖI] Tìm kiếm thất bại sau {max_retries} lần thử. Vui lòng kiểm tra kết nối hoặc IP."
        )
        return False

    def _rank_and_select_best_url(self):
        """Dùng BM25 để xếp hạng và chọn URL tốt nhất dựa trên truy vấn."""
        logging.info("\n--- BƯỚC 2: XẾP HẠNG VÀ CHỌN URL TỐT NHẤT ---")

        if not self.candidate_urls:
            return False

        tokenized_corpus = [
            re.split(r"[^a-z0-9]+", self._remove_diacritics(url))
            for url in self.candidate_urls
        ]
        tokenized_query = self._remove_diacritics(self.query).split()

        try:
            bm25 = BM25Okapi(tokenized_corpus)
            doc_scores = bm25.get_scores(tokenized_query)
            best_doc_index = doc_scores.argmax()
            self.best_url = self.candidate_urls[best_doc_index]

            logging.info(
                f"   [KẾT QUẢ] URL tốt nhất được chọn (điểm BM25: {doc_scores[best_doc_index]:.2f}):"
            )
            logging.info(f"   -> {self.best_url}")
            return True
        except Exception as e:
            logging.error(f"   [LỖI] Đã xảy ra lỗi trong quá trình xếp hạng BM25: {e}")
            return False

    def _crawl_clean_and_save(self):
        """Tải, làm sạch và lưu nội dung từ URL đã chọn."""
        logging.info("\n--- BƯỚC 3: CÀO, LÀM SẠCH VÀ LƯU NỘI DUNG ---")
        os.makedirs(self.output_dir, exist_ok=True)

        # <<< THAY ĐỔI 2: SỬA LẠI CÁCH ĐẶT TÊN FILE OUTPUT >>>
        # Tạo tên file động, ví dụ: output_5.txt, output_7.txt
        filename = (
            f"output_{self.shot_index}.txt"
            if self.shot_index is not None
            else "output.txt"
        )
        output_file = os.path.join(self.output_dir, filename)

        logging.info(f"   [INFO] Đang xử lý URL: {self.best_url}")

        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
            }
            response = requests.get(self.best_url, headers=headers, timeout=20)
            response.raise_for_status()
            cleaned_content = trafilatura.extract(response.text, favor_recall=True)

            if cleaned_content:
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(cleaned_content)
                logging.info(
                    f"   [THÀNH CÔNG] Đã lưu nội dung sạch vào file: '{output_file}'"
                )
                return True
            else:
                logging.warning(
                    "   [LỖI] Trafilatura không trích xuất được nội dung chính."
                )
                return False

        except Exception as e:
            logging.error(
                f"   [LỖI] Đã xảy ra lỗi trong quá trình cào và lưu file: {e}"
            )
            return False

    def run(self):
        """
        Thực thi toàn bộ pipeline theo một luồng logic rõ ràng.
        """
        logging.info("\n================= BẮT ĐẦU PIPELINE =================")

        if not self._find_candidate_urls():
            logging.error("Pipeline dừng lại vì không tìm thấy URL ứng viên.")
            logging.info("================= KẾT THÚC PIPELINE =================\n")
            return

        if not self._rank_and_select_best_url():
            logging.error("Pipeline dừng lại vì không thể xếp hạng hoặc chọn URL.")
            logging.info("================= KẾT THÚC PIPELINE =================\n")
            return

        self._crawl_clean_and_save()

        logging.info("\n================= KẾT THÚC PIPELINE =================\n")
