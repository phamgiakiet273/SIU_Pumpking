import os
import ast
from typing import List

class HubConfig:
    def __init__(self) -> None:
        self.REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", 10))
        # BASIC STUFFS with defaults
        self.HUB_HOST: str = os.getenv(
            "HUB_HOST",
            "0.0.0.0"
        )

        self.HUB_PORT: int = int(os.getenv(
            "HUB_PORT",
            "9021"
        ))

        self.HUB_MAX_WORKERS: int = int(os.getenv(
            "HUB_MAX_WORKERS",
            "5"
        ))

        # Downstream services. Defaults point at localhost so a fresh checkout
        # never reaches out to the (now dead) api.siu.edu.vn gateway.
        # Override in .env with an ngrok / port-forward URL when the hub runs
        # on a different machine than the services.
        self.SIGLIP_V2_HOST_PUBLIC = os.getenv("SIGLIP_V2_HOST_PUBLIC", "http://localhost:9029")
        self.SIGLIP_V2_B_HOST_PUBLIC = os.getenv("SIGLIP_V2_B_HOST_PUBLIC", "http://localhost:9030")

        self.RERANK_HOST_PUBLIC = os.getenv("RERANK_HOST_PUBLIC", "http://localhost:9026")
        self.UTIL_HOST_PUBLIC = os.getenv("UTIL_HOST_PUBLIC", "http://localhost:9025")
        self.SUBMISSION_HOST_PUBLIC = os.getenv("SUBMISSION_HOST_PUBLIC", "http://localhost:9024")

        # Optional downstream services. When disabled the hub never opens a
        # socket to them and the matching routes/UI are not registered.
        self.ENABLE_SUBMISSION: bool = os.getenv("ENABLE_SUBMISSION", "false").lower() == "true"
        self.ENABLE_SIGLIP_BETA: bool = os.getenv("ENABLE_SIGLIP_BETA", "false").lower() == "true"
        self.ENABLE_RERANK: bool = os.getenv("ENABLE_RERANK", "false").lower() == "true"

        # --- VALIDATIONS ---
        assert self.HUB_HOST, "HUB_HOST must be set"
        assert self.HUB_PORT, "HUB_PORT must be set"
        assert self.HUB_MAX_WORKERS, "HUB_MAX_WORKERS must be set"
