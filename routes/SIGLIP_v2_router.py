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

from handlers.SIGLIP_v2_handler import SIGLIPV2Handler
from utils.logger import get_logger

logger = get_logger()


def setup_router(handler: SIGLIPV2Handler) -> APIRouter:
    logger.info("setting up routers...")

    router = APIRouter()

    logger.info("setting up SIGLIP vector retrieval router...")
    siglip_router = APIRouter()

    # Health check
    siglip_router.add_api_route(
        "/ping",
        endpoint=handler.ping_handler,
        methods=["GET"],
    )

    siglip_router.add_api_route(
        "/setup_database", endpoint=handler.setup_database_handler, methods=["GET"]
    )

    # # Preprocess text to feature
    # siglip_router.add_api_route(
    #     "/preprocess",
    #     endpoint=handler.preprocess_handler,
    #     methods=["POST"],
    # )

    # Scroll video segments
    siglip_router.add_api_route(
        "/scroll",
        endpoint=handler.scroll_handler,
        methods=["POST"],
    )

    # Text-based vector search
    siglip_router.add_api_route(
        "/text_search",
        endpoint=handler.text_search_handler,
        methods=["POST"],
    )

    # Image-based vector search
    siglip_router.add_api_route(
        "/image_search",
        endpoint=handler.image_search_handler,
        methods=["POST"],
    )

    # Temporal (multi-segment) text search
    siglip_router.add_api_route(
        "/temporal_search",
        endpoint=handler.temporal_search_handler,
        methods=["POST"],
    )

    logger.info("SIGLIP v2 router setup successfully")

    logger.info("adding routers...")
    router.include_router(
        siglip_router,
        prefix="/siglip_v2",
        tags=["SIU_Pumpking"],
    )
    logger.info("routers setup successfully")

    return router
