# file: utils.py
import re


def remove_diacritics(text: str) -> str:
    """
    Hàm trợ giúp để loại bỏ dấu câu khỏi chuỗi tiếng Việt và chuyển thành chữ thường.

    Args:
        text (str): Chuỗi đầu vào có dấu.

    Returns:
        str: Chuỗi đầu ra đã được loại bỏ dấu.
    """
    s = text.lower()
    s = re.sub(r"[àáạảãâầấậẩẫăằắặẳẵ]", "a", s)
    s = re.sub(r"[èéẹẻẽêềếệểễ]", "e", s)
    s = re.sub(r"[ìíịỉĩ]", "i", s)
    s = re.sub(r"[òóọỏõôồốộổỗơờớợởỡ]", "o", s)
    s = re.sub(r"[ùúụủũưừứựửữ]", "u", s)
    s = re.sub(r"[ỳýỵỷỹ]", "y", s)
    s = re.sub(r"[đ]", "d", s)
    return s
