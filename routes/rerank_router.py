from fastapi import APIRouter

from pathlib import Path
import sys

current_path = Path(__file__).resolve()
for parent in current_path.parents:
    if parent.name == "SIU_Pumpking":
        #print(f"Adding {parent} to sys.path")
        sys.path.append(str(parent))
        break
else:
    raise RuntimeError("Could not find 'SIU_Pumpking' in the path hierarchy.")

from handlers.rerank_handler import RerankHandler
from utils.logger import get_logger

logger = get_logger()


def setup_router(handler: RerankHandler) -> APIRouter:
    logger.info("setting up routers...")

    router = APIRouter()

    logger.info("setting up rerank router...")
    rerank_router = APIRouter()

    # Health check
    rerank_router.add_api_route(
        "/ping",
        endpoint=handler.ping_handler,
        methods=["GET"],
    )

    rerank_router.add_api_route(
        "/rerank_color", endpoint=handler.color_rerank_handler, methods=["POST"]
    )

    logger.info("Rerank router setup successfully")

    logger.info("adding routers...")
    router.include_router(
        rerank_router,
        prefix="/rerank",
        tags=["SIU_Pumpking"],
    )
    logger.info("routers setup successfully")

    return router
