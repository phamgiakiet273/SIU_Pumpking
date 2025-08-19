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

from handlers.util_handler import UtilHandler
from utils.logger import get_logger

logger = get_logger()


def setup_router(handler: UtilHandler) -> APIRouter:
    logger.info("setting up routers...")

    router = APIRouter()

    logger.info("setting up util router...")
    util_router = APIRouter()

    # Health check
    util_router.add_api_route(
        "/ping",
        endpoint=handler.ping_handler,
        methods=["GET"],
    )

    util_router.add_api_route(
        "/translate", endpoint=handler.translate_handler, methods=["POST"]
    )

    util_router.add_api_route(
        "/get_neighboring_frames",
        endpoint=handler.get_neighboring_frames_handler,
        methods=["POST"],
    )

    util_router.add_api_route(
        "/get_vector", endpoint=handler.get_vector_handler, methods=["POST"]
    )

    util_router.add_api_route(
        "/get_video_names", endpoint=handler.get_video_names_handler, methods=["POST"]
    )

    logger.info("Util router setup successfully")

    logger.info("adding routers...")
    router.include_router(
        util_router,
        prefix="/util",
        tags=["SIU_Pumpking"],
    )
    logger.info("routers setup successfully")

    return router
