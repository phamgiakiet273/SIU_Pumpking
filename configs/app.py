import os
import ast
from typing import List


class AppConfig:
    def __init__(self) -> None:
        # BASIC STUFFS with defaults
        self.TRANSFORMERS_CACHE: str = os.getenv(
            "TRANSFORMERS_CACHE",
            "/workspace/competitions/AIC_2025/SIU_Pumpking/data/weights",
        )
        self.CUDA_DEVICE_ORDER: str = os.getenv("CUDA_DEVICE_ORDER", "PCI_BUS_ID")

        # FRAMES AND METADATA (required)
        self.DATASET_PATH_ORIGIN: str = os.getenv("DATASET_PATH_ORIGIN")
        self.DATASET_PATH_TEAM: str = os.getenv("DATASET_PATH_TEAM")
        self.KEYFRAME_FOLDER_PATH: str = os.getenv("KEYFRAME_FOLDER_PATH")
        self.SPLIT_NAME_LOW_RES: str = os.getenv("SPLIT_NAME_LOW_RES")
        self.SPLIT_NAME: str = os.getenv("SPLIT_NAME")
        self.DATASET_INDEX: str = os.getenv("DATASET_INDEX")

        # List variables: parse like Python lists
        self.LOWRES_FORMAT: str = os.getenv("LOWRES_FORMAT")
        s2t_env = os.getenv("S2T_PATH", "[]")
        self.S2T_PATH: List[str] = ast.literal_eval(s2t_env)

        self.OBJECT_PATH: str = os.getenv("OBJECT_PATH")

        fps_env = os.getenv("FPS_PATH", "[]")
        self.FPS_PATH: List[str] = ast.literal_eval(fps_env)

        shot_env = os.getenv("SHOT_PATH", "[]")
        self.SHOT_PATH: List[str] = ast.literal_eval(shot_env)
        # --- VALIDATIONS ---

        # Mandatory string values
        for var in [
            "TRANSFORMERS_CACHE",
            "CUDA_DEVICE_ORDER",
            "KEYFRAME_FOLDER_PATH",
            "SPLIT_NAME_LOW_RES",
            "SPLIT_NAME",
            "DATASET_INDEX",
            "OBJECT_PATH",
            "LOWRES_FORMAT",
            "DATASET_PATH_ORIGIN",
            "DATASET_PATH_TEAM",
        ]:
            val = getattr(self, var)
            assert val, f"{var} must be set"

        # Directory checks
        for dir_var in [
            "KEYFRAME_FOLDER_PATH",
            "DATASET_INDEX",
            "DATASET_PATH_ORIGIN",
            "DATASET_PATH_TEAM",
        ]:
            dir_val = getattr(self, dir_var)
            if not os.path.isdir(dir_val):
                raise NotADirectoryError(
                    f"{dir_var}='{dir_val}' does not exist or is not a directory"
                )

        # File check
        if not os.path.isfile(self.OBJECT_PATH):
            raise FileNotFoundError(f"{self.OBJECT_PATH} does not exist")

        for path in self.S2T_PATH:
            if not os.path.isfile(path):
                raise FileNotFoundError(f"S2T_PATH entry '{path}' does not exist")

        for path in self.FPS_PATH:
            if not os.path.isfile(path):
                raise FileNotFoundError(f"FPS_PATH entry '{path}' does not exist")

        # LOWRES_FORMAT validation (example: jpg, png)
        valid_formats = {".avif", ".jpg"}
        if self.LOWRES_FORMAT.lower() not in valid_formats:
            raise ValueError(
                f"LOWRES_FORMAT '{self.LOWRES_FORMAT}' is invalid. Must be one of {valid_formats}"
            )
