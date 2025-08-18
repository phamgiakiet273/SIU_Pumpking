import os


class SubmissionConfig:
    def __init__(self) -> None:
        self.REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", 10))
        self.SUBMISSION_HOST = os.getenv("SUBMISSION_HOST", "0.0.0.0")
        self.SUBMISSION_PORT = int(os.getenv("SUBMISSION_PORT", "9184"))
        self.SUBMISSION_MAX_WORKERS = int(os.getenv("SUBMISSION_MAX_WORKERS", "5"))
        self.SUBMIT_BASE_URL = os.getenv(
            "SUBMIT_BASE_URL", "https://api.siu.edu.vn/siu_chillout_1"
        )
        self.SUBMIT_USERNAME = os.getenv("SUBMIT_USERNAME", "siu_pumpking")
        self.SUBMIT_PASSWORD = os.getenv("SUBMIT_PASSWORD", "siu_pumpking")
