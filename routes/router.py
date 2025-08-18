from fastapi import APIRouter

import sys

sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking/")

from handler.general import GeneralHandler
from utils.logger import get_logger

logger = get_logger()


def setup_router(handler: GeneralHandler) -> APIRouter:
    logger.info("setting up routers...")

    router = APIRouter()

    logger.info("setting up general router...")
    general_router = APIRouter()
    general_router.add_api_route(
        "/ping",
        endpoint=handler.ping_handler,
        methods=["GET"],
    )

    logger.info("general router setup successfully")

    logger.info("adding routers...")
    router.include_router(general_router, prefix="/general", tags=["General"])
    logger.info("routers setup successfully")

    return router
