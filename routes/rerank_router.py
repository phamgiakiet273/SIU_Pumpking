from fastapi import APIRouter

import sys

sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking/")

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
