import os
import ast
from typing import List

class ResultManagerConfig:
    def __init__(self) -> None:
        self.REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", 10))
        # BASIC STUFFS with defaults
        self.RESULT_MANAGER_HOST: str = os.getenv(
            "RESULT_MANAGER_HOST",
            "0.0.0.0"
        )        
        
        self.RESULT_MANAGER_PORT: int = int(os.getenv(
            "RESULT_MANAGER_PORT",
            "9181"
        ))
        
        self.RESULT_MANAGER_MAX_WORKERS: int = int(os.getenv(
            "RESULT_MANAGER_MAX_WORKERS",
            "5"
        ))
               
        # --- VALIDATIONS ---
        assert self.RESULT_MANAGER_HOST, "RESULT_MANAGER_HOST must be set"
        assert self.RESULT_MANAGER_PORT, "RESULT_MANAGER_PORT must be set"
        assert self.RESULT_MANAGER_MAX_WORKERS, "RESULT_MANAGER_MAX_WORKERS must be set"       