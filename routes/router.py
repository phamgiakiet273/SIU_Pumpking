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
