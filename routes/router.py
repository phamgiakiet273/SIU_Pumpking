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
