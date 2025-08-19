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

from handlers.submission_handler import SubmissionHandler
from utils.logger import get_logger

logger = get_logger()


def setup_router(handler: SubmissionHandler) -> APIRouter:
    logger.info("setting up routers...")

    router = APIRouter()

    logger.info("setting up util router...")
    submission_router = APIRouter()

    # Health check
    submission_router.add_api_route(
        "/ping", endpoint=handler.ping_handler, methods=["GET"]
    )

    submission_router.add_api_route(
        "/get_session_id", endpoint=handler.get_session_id_handler, methods=["GET"]
    )

    submission_router.add_api_route(
        "/get_eval_id", endpoint=handler.get_eval_id_handler, methods=["GET"]
    )

    # DRES submission
    submission_router.add_api_route(
        "/submit", endpoint=handler.submit_handler, methods=["POST"]
    )

    submission_router.add_api_route(
        "/relogin", endpoint=handler.relogin, methods=["GET"]
    )

    logger.info("Util router setup successfully")

    logger.info("adding routers...")
    router.include_router(
        submission_router,
        prefix="/submission",
        tags=["SIU_Pumpking"],
    )
    logger.info("routers setup successfully")

    return router
