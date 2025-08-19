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

from handlers.METACLIP_v2_handler import METACLIPV2Handler
from utils.logger import get_logger

logger = get_logger()


def setup_router(handler: METACLIPV2Handler) -> APIRouter:
    logger.info("setting up routers...")

    router = APIRouter()

    logger.info("setting up METACLIP router...")
    metaclip_v2_router = APIRouter()

    # Health check
    metaclip_v2_router.add_api_route(
        "/ping",
        endpoint=handler.ping_handler,
        methods=["GET"],
    )

    metaclip_v2_router.add_api_route(
        "/setup_database", endpoint=handler.setup_database_handler, methods=["GET"]
    )

    # Scroll video segments
    metaclip_v2_router.add_api_route(
        "/scroll",
        endpoint=handler.scroll_handler,
        methods=["POST"],
    )

    # Text-based vector search
    metaclip_v2_router.add_api_route(
        "/text_search",
        endpoint=handler.text_search_handler,
        methods=["POST"],
    )

    # Image-based vector search
    metaclip_v2_router.add_api_route(
        "/image_search",
        endpoint=handler.image_search_handler,
        methods=["POST"],
    )

    # Temporal (multi-segment) text search
    metaclip_v2_router.add_api_route(
        "/temporal_search",
        endpoint=handler.temporal_search_handler,
        methods=["POST"],
    )

    logger.info("METACLIP router setup successfully")

    logger.info("adding routers...")
    router.include_router(
        metaclip_v2_router,
        prefix="/metaclip_v2",
        tags=["SIU_Pumpking"],
    )
    logger.info("routers setup successfully")

    return router
