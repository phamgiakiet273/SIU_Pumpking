import os
import ast
from typing import List


class RerankConfig:
    def __init__(self) -> None:
        self.RERANK_HOST = os.getenv("RERANK_HOST", "0.0.0.0")
        self.RERANK_PORT = int(os.getenv("RERANK_PORT", "9186"))
        self.RERANK_MAX_WORKERS = int(os.getenv("RERANK_MAX_WORKERS", "1"))

        rerank_color = os.getenv("RERANK_COLOR_PATH")
        assert rerank_color, "Environment variable 'RERANK_COLOR_PATH' must be set"
        try:
            self.RERANK_COLOR_PATH: List[str] = ast.literal_eval(rerank_color)
        except Exception as e:
            raise ValueError(
                f"Invalid list format for RERANK_COLOR_PATH: {rerank_color}"
            ) from e
