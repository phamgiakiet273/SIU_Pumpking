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

from configs.hub_config import HubConfig
from handlers.hub_handler import HubHandler
from utils.logger import get_logger

logger = get_logger()


def setup_router(handler: HubHandler) -> APIRouter:
    logger.info("setting up routers...")

    config = HubConfig()
    router = APIRouter()

    logger.info("setting up Hub vector retrieval router...")
    hub_router = APIRouter()

    # Health check
    hub_router.add_api_route(
        "/ping",
        endpoint=handler.ping_handler,
        methods=["GET"],
    )

    # return file from server -> client, direct download.
    hub_router.add_api_route(
        "/send_file/{file_path:path}",  # add path parameter
        endpoint=handler.send_file_handler,
        methods=["GET"],
        name="send_file"
    )
    
    #===============================================
    # Receive query text -> service SIGLIP to find video/frame.
    hub_router.add_api_route(
        "/siglip_alpha_text_search",
        endpoint=handler.siglip_v2_text_query_handler,
        methods=["POST"]
    )

    # Receive query image -> service SIGLIP to find video/frame.
    hub_router.add_api_route(
        "/siglip_alpha_image_search",
        endpoint=handler.siglip_v2_image_query_handler,
        methods=["POST"]
    )

    # Nhận truy vấn là một chuỗi text (multi-segment), tìm kiếm các đoạn video liên quan theo thời gian diễn ra sự kiện trong query (temporal search).
    hub_router.add_api_route(
        "/siglip_alpha_temporal_search",
        endpoint=handler.siglip_v2_temporal_query_handler,
        methods=["POST"]
    )

    # Get more results (scroll/pagination) for searched videos/frames
    hub_router.add_api_route(
        "/siglip_alpha_scroll",
        endpoint=handler.siglip_v2_scroll_handler,
        methods=["POST"]
    )   
    
    #===============================================
    # SIGLIP "beta" is a second, optional index. Only mount it when the
    # SIGLIP_v2_B_service is actually running (ENABLE_SIGLIP_BETA=true).
    if config.ENABLE_SIGLIP_BETA:
        logger.info("SIGLIP beta enabled - mounting /siglip_beta_* routes")
        hub_router.add_api_route(
            "/siglip_beta_text_search",
            endpoint=handler.siglip_v2_beta_text_query_handler,
            methods=["POST"]
        )

        hub_router.add_api_route(
            "/siglip_beta_image_search",
            endpoint=handler.siglip_v2_beta_image_query_handler,
            methods=["POST"]
        )

        hub_router.add_api_route(
            "/siglip_beta_temporal_search",
            endpoint=handler.siglip_v2_beta_temporal_query_handler,
            methods=["POST"]
        )

        hub_router.add_api_route(
            "/siglip_beta_scroll",
            endpoint=handler.siglip_v2_beta_scroll_handler,
            methods=["POST"]
        )
    else:
        logger.info("SIGLIP beta disabled - skipping /siglip_beta_* routes")
    #===============================================

    # Receive metadata video, rerank based on color.
    if config.ENABLE_RERANK:
        logger.info("Rerank enabled - mounting /rerank_color route")
        hub_router.add_api_route(
            "/rerank_color",
            endpoint=handler.rerank_color_handler,
            methods=["POST"]
        )
    else:
        logger.info("Rerank disabled - skipping /rerank_color route")

    hub_router.add_api_route(
        "/send_img/{full_path:path}",
        endpoint=handler.send_img_handler,
        methods=["GET"],
    )
    
    hub_router.add_api_route(
        "/send_img_original/{full_path:path}", 
        endpoint=handler.send_img_original_handler,
        methods=["GET"]
    )

    # Catch-all route for videos:
    hub_router.add_api_route(
        "/send_video/{full_path:path}",
        endpoint=handler.send_video_handler,
        methods=["GET"],
    )
    
    # hub_router.add_api_route(
    #     "/send_video_original/{full_path:path}",
    #     endpoint=handler.send_video_original_handler,
    #     methods=["GET"],
    # )
    
    hub_router.add_api_route(
        "/translate",
        endpoint=handler.translate_handler,
        methods=["POST"],
    )
    
    # DRES submission. Dead outside of a live competition, so it is opt-in via
    # ENABLE_SUBMISSION - otherwise the hub would block on a service that is
    # not running every time the UI asks for a session/eval id.
    if config.ENABLE_SUBMISSION:
        logger.info("Submission enabled - mounting DRES submission routes")
        hub_router.add_api_route(
            "/submit_KIS",
            endpoint=handler.submit_KIS_handler,
            methods=["POST"],
        )

        hub_router.add_api_route(
            "/submit_QA",
            endpoint=handler.submit_QA_handler,
            methods=["POST"],
        )

        hub_router.add_api_route(
            "/submit_TRAKE",
            endpoint=handler.submit_TRAKE_handler,
            methods=["POST"],
        )

        hub_router.add_api_route(
            "/get_session_and_eval_id",
            endpoint=handler.get_sessionID_evalID_DRES_handler,
            methods=["GET"],
        )

        hub_router.add_api_route(
            "/update_session_eval_id",
            endpoint=handler.update_session_eval_id_handler,
            methods=["GET"],
        )
    else:
        logger.info("Submission disabled - skipping DRES submission routes")

    hub_router.add_api_route(
        "/get_neighboring_frames",
        endpoint=handler.get_neighboring_frames_handler,
        methods=["POST"],
    )
    
    hub_router.add_api_route(
        "/get_vector_of_frame",
        endpoint=handler.get_vector_of_frame_handler,
        methods=["POST"],
    )
    
    hub_router.add_api_route(
        "/get_video_names_of_batch",
        endpoint=handler.get_video_names_of_batch_handler,
        methods=["POST"],
    )

    # test request timeout
    # import asyncio
    # @router.get("/sleep")
    # async def sleep_route(seconds: int = 15):
    #     await asyncio.sleep(seconds)
    #     return {"slept": seconds}

    logger.info("Hub router setup successfully")

    logger.info("adding routers...")
    router.include_router(
        hub_router,
        prefix="/hub",
        tags=["SIU_Pumpking"],
    )
    logger.info("routers setup successfully")

    return router