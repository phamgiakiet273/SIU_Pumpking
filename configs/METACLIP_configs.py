import os
import ast
from typing import List


class METACLIPConfig:
    def __init__(self) -> None:
        self.REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", 10))
        self.TIMEOUT_KEEP_ALIVE = int(os.getenv("TIMEOUT_KEEP_ALIVE", 30))
        self.METACLIP_HOST = os.getenv("METACLIP_HOST", "0.0.0.0")
        self.METACLIP_PORT = int(os.getenv("METACLIP_PORT", "9189"))
        self.METACLIP_MAX_WORKERS = int(os.getenv("METACLIP_MAX_WORKERS", "1"))
        self.METACLIP_CUDA_VISIBLE_DEVICES = os.getenv(
            "METACLIP_CUDA_VISIBLE_DEVICES", "2"
        )

        self.METACLIP_DATABASE_NAME = os.getenv("METACLIP_DATABASE_NAME")
        assert (
            self.METACLIP_DATABASE_NAME
        ), "Environment variable 'METACLIP_DATABASE_NAME' must be set"

        features_path_env = os.getenv("METACLIP_FEATURES_PATH")
        assert (
            features_path_env
        ), "Environment variable 'METACLIP_FEATURES_PATH' must be set"
        try:
            self.METACLIP_FEATURES_PATH: List[str] = ast.literal_eval(features_path_env)
        except Exception as e:
            raise ValueError(
                f"Invalid list format for METACLIP_FEATURES_PATH: {features_path_env}"
            ) from e

        for path in self.METACLIP_FEATURES_PATH:
            if not os.path.exists(path):
                raise FileNotFoundError(f"Feature path '{path}' does not exist")

        self.METACLIP_FEATURES_SIZE = int(os.getenv("METACLIP_FEATURES_SIZE", "1024"))

        self.METACLIP_DUMMY_VECTOR_PATH = os.getenv("METACLIP_DUMMY_VECTOR_PATH")
        assert (
            self.METACLIP_DUMMY_VECTOR_PATH
        ), "Environment variable 'METACLIP_DUMMY_VECTOR_PATH' must be set"

        if not os.path.exists(self.METACLIP_DUMMY_VECTOR_PATH):
            raise FileNotFoundError(
                f"Dummy vector path '{self.METACLIP_DUMMY_VECTOR_PATH}' does not exist"
            )

        self.HUGGINGFACE_HUB_TOKEN = os.getenv("HUGGINGFACE_HUB_TOKEN")
