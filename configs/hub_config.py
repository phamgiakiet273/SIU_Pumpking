import os
import ast
from typing import List


class HubConfig:
    def __init__(self) -> None:
        self.REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", 10))
        # BASIC STUFFS with defaults
        self.HUB_HOST: str = os.getenv(
            "HUB_HOST", "/workspace/competitions/AIC_2025/SIU_Pumpking/data/weights"
        )

        self.HUB_PORT: int = int(os.getenv("HUB_PORT", "9181"))

        self.HUB_MAX_WORKERS: int = int(os.getenv("HUB_MAX_WORKERS", "5"))

        # --- VALIDATIONS ---
        assert self.HUB_HOST, "HUB_HOST must be set"
        assert self.HUB_PORT, "HUB_PORT must be set"
        assert self.HUB_MAX_WORKERS, "HUB_MAX_WORKERS must be set"
