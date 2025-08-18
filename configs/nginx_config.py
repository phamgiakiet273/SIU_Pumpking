import os
import ast
from typing import List


class NGINXConfig:
    def __init__(self) -> None:
        # BASIC STUFFS with defaults
        self.NGINX_IMAGE_PORT: str = os.getenv("NGINX_IMAGE_PORT", "9187")

        self.NGINX_VIDEO_PORT: str = os.getenv("NGINX_VIDEO_PORT", "9188")

        self.NGINX_IMAGE_HOST: str = os.getenv(
            "NGINX_IMAGE_HOST", "http://localhost:9187/img"
        )

        self.NGINX_VIDEO_HOST: str = os.getenv(
            "NGINX_VIDEO_HOST", "http://localhost:9188/video"
        )

        # --- VALIDATIONS ---
        assert self.NGINX_IMAGE_PORT, "NGINX_IMAGE_PORT must be set"
        assert self.NGINX_VIDEO_PORT, "NGINX_VIDEO_PORT must be set"
