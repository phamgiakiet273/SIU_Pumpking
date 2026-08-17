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
        "/ping",
        endpoint=handler.ping_handler,
        methods=["GET"]
    )
    
    submission_router.add_api_route(
        "/get_session_id",
        endpoint=handler.get_session_id_handler,
        methods=["GET"]
    )

    submission_router.add_api_route(
        "/get_eval_id",
        endpoint=handler.get_eval_id_handler,
        methods=["GET"]
    )

    # DRES submission
    submission_router.add_api_route(
        "/submit_kis",
        endpoint=handler.submit_kis_handler,
        methods=["POST"]
    )
    
    submission_router.add_api_route(
        "/submit_qa",
        endpoint=handler.submit_qa_handler,
        methods=["POST"]
    )
    
    submission_router.add_api_route(
        "/submit_trake",
        endpoint=handler.submit_trake_handler,
        methods=["POST"]
    )
    
    submission_router.add_api_route(
        "/relogin",
        endpoint=handler.relogin,
        methods=["GET"]
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