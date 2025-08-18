import os
import ast
from typing import List


class SIGLIPV2Config:
    def __init__(self) -> None:
        self.REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", 10))
        self.TIMEOUT_KEEP_ALIVE = int(os.getenv("TIMEOUT_KEEP_ALIVE", 30))
        self.SIGLIP_V2_HOST = os.getenv("SIGLIP_V2_HOST", "0.0.0.0")
        self.SIGLIP_V2_PORT = int(os.getenv("SIGLIP_V2_PORT", "9189"))
        self.SIGLIP_V2_MAX_WORKERS = int(os.getenv("SIGLIP_V2_MAX_WORKERS", "1"))
        self.SIGLIP_V2_CUDA_VISIBLE_DEVICES = os.getenv(
            "SIGLIP_V2_CUDA_VISIBLE_DEVICES", "2"
        )

        self.SIGLIP_V2_DATABASE_NAME = os.getenv("SIGLIP_V2_DATABASE_NAME")
        assert (
            self.SIGLIP_V2_DATABASE_NAME
        ), "Environment variable 'SIGLIP_V2_DATABASE_NAME' must be set"

        features_path_env = os.getenv("SIGLIP_V2_FEATURES_PATH")
        assert (
            features_path_env
        ), "Environment variable 'SIGLIP_V2_FEATURES_PATH' must be set"
        try:
            self.SIGLIP_V2_FEATURES_PATH: List[str] = ast.literal_eval(
                features_path_env
            )
        except Exception as e:
            raise ValueError(
                f"Invalid list format for SIGLIP_V2_FEATURES_PATH: {features_path_env}"
            ) from e

        for path in self.SIGLIP_V2_FEATURES_PATH:
            if not os.path.exists(path):
                raise FileNotFoundError(f"Feature path '{path}' does not exist")

        self.SIGLIP_V2_FEATURES_SIZE = int(os.getenv("SIGLIP_V2_FEATURES_SIZE", "1536"))

        self.SIGLIP_V2_DUMMY_VECTOR_PATH = os.getenv("SIGLIP_V2_DUMMY_VECTOR_PATH")
        assert (
            self.SIGLIP_V2_DUMMY_VECTOR_PATH
        ), "Environment variable 'SIGLIP_V2_DUMMY_VECTOR_PATH' must be set"

        if not os.path.exists(self.SIGLIP_V2_DUMMY_VECTOR_PATH):
            raise FileNotFoundError(
                f"Dummy vector path '{self.SIGLIP_V2_DUMMY_VECTOR_PATH}' does not exist"
            )

        self.HUGGINGFACE_HUB_TOKEN = os.getenv("HUGGINGFACE_HUB_TOKEN")
