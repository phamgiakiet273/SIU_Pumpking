from fastapi import APIRouter

from pathlib import Path
import sys

current_path = Path(__file__).resolve()
for parent in current_path.parents:
    # Project root is detected by content (it holds configs/ and utils/)
    # rather than by folder name, so the tree can be checked out under any
    # directory name - e.g. SIU_Pumpking_local on a client machine.
    if (parent / "configs").is_dir() and (parent / "utils").is_dir():
        sys.path.append(str(parent))
        break
else:
    raise RuntimeError("Could not find the SIU_Pumpking project root (a parent directory containing configs/ and utils/).")

from handlers.METACLIP_handler import METACLIPHandler
from utils.logger import get_logger

logger = get_logger()


def setup_router(handler: METACLIPHandler) -> APIRouter:
    logger.info("setting up routers...")

    router = APIRouter()

    logger.info("setting up METACLIP router...")
    metaclip_router = APIRouter()

    # Health check
    metaclip_router.add_api_route(
        "/ping",
        endpoint=handler.ping_handler,
        methods=["GET"],
    )

    metaclip_router.add_api_route(
        "/setup_database", endpoint=handler.setup_database_handler, methods=["GET"]
    )

    # Scroll video segments
    metaclip_router.add_api_route(
        "/scroll",
        endpoint=handler.scroll_handler,
        methods=["POST"],
    )

    # Text-based vector search
    metaclip_router.add_api_route(
        "/text_search",
        endpoint=handler.text_search_handler,
        methods=["POST"],
    )

    # Image-based vector search
    metaclip_router.add_api_route(
        "/image_search",
        endpoint=handler.image_search_handler,
        methods=["POST"],
    )

    # Temporal (multi-segment) text search
    metaclip_router.add_api_route(
        "/temporal_search",
        endpoint=handler.temporal_search_handler,
        methods=["POST"],
    )

    logger.info("METACLIP router setup successfully")

    logger.info("adding routers...")
    router.include_router(
        metaclip_router,
        prefix="/metaclip",
        tags=["SIU_Pumpking"],
    )
    logger.info("routers setup successfully")

    return router
