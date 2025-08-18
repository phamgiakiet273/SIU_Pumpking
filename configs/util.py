import os


class UtilConfig:
    def __init__(self) -> None:
        self.REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", 10))
        self.UTIL_HOST = os.getenv("UTIL_HOST", "0.0.0.0")
        self.UTIL_PORT = int(os.getenv("UTIL_PORT", "9185"))
        self.UTIL_MAX_WORKERS = int(os.getenv("UTIL_MAX_WORKERS", "5"))
        self.GG_TRANSLATE_API_KEY = os.getenv("GG_TRANSLATE_API_KEY")
        self.GG_TRANSLATE_ENDPOINT = os.getenv("GG_TRANSLATE_ENDPOINT")
        self.BASE_PATH = os.getenv(
            "BASE_PATH", "/workspace/competitions/AIC_2025/SIU_Pumpking/data/"
        )
        self.DATASET_PATH_TEAM = os.getenv("DATASET_PATH_TEAM")
