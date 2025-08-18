from fastapi import APIRouter

import sys

sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking/")

from handlers.hub_handler import HubHandler
from utils.logger import get_logger

logger = get_logger()


def setup_router(handler: HubHandler) -> APIRouter:
    logger.info("setting up routers...")

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
        name="send_file",
    )

    # ===============================================
    # Receive query text -> service SIGLIP to find video/frame.
    hub_router.add_api_route(
        "/siglip_v2_text_search",
        endpoint=handler.siglip_v2_text_query_handler,
        methods=["POST"],
    )

    # Receive query image -> service SIGLIP to find video/frame.
    hub_router.add_api_route(
        "/siglip_v2_image_search",
        endpoint=handler.siglip_v2_image_query_handler,
        methods=["POST"],
    )

    # Nhận truy vấn là một chuỗi text (multi-segment), tìm kiếm các đoạn video liên quan theo thời gian diễn ra sự kiện trong query (temporal search).
    hub_router.add_api_route(
        "/siglip_v2_temporal_search",
        endpoint=handler.siglip_v2_temporal_query_handler,
        methods=["POST"],
    )

    # Get more results (scroll/pagination) for searched videos/frames
    hub_router.add_api_route(
        "/siglip_v2_scroll", endpoint=handler.siglip_v2_scroll_handler, methods=["POST"]
    )

    # ===============================================
    hub_router.add_api_route(
        "/metaclip_text_search",
        endpoint=handler.metaclip_text_query_handler,
        methods=["POST"],
    )

    hub_router.add_api_route(
        "/metaclip_image_search",
        endpoint=handler.metaclip_image_query_handler,
        methods=["POST"],
    )

    hub_router.add_api_route(
        "/metaclip_temporal_search",
        endpoint=handler.metaclip_temporal_query_handler,
        methods=["POST"],
    )

    hub_router.add_api_route(
        "/metaclip_scroll", endpoint=handler.metaclip_scroll_handler, methods=["POST"]
    )
    # ===============================================
    hub_router.add_api_route(
        "/metaclip_v2_text_search",
        endpoint=handler.metaclip_v2_text_query_handler,
        methods=["POST"],
    )

    hub_router.add_api_route(
        "/metaclip_v2_image_search",
        endpoint=handler.metaclip_v2_image_query_handler,
        methods=["POST"],
    )

    hub_router.add_api_route(
        "/metaclip_v2_temporal_search",
        endpoint=handler.metaclip_v2_temporal_query_handler,
        methods=["POST"],
    )

    hub_router.add_api_route(
        "/metaclip_v2_scroll",
        endpoint=handler.metaclip_v2_scroll_handler,
        methods=["POST"],
    )
    # ===============================================

    # Receive metadata video, rerank based on color.
    hub_router.add_api_route(
        "/rerank_color", endpoint=handler.rerank_color_handler, methods=["POST"]
    )

    hub_router.add_api_route(
        "/send_img/{full_path:path}",
        endpoint=handler.send_img_handler,
        methods=["GET"],
    )

    # Catch-all route for videos:
    hub_router.add_api_route(
        "/send_video/{full_path:path}",
        endpoint=handler.send_video_handler,
        methods=["GET"],
    )

    hub_router.add_api_route(
        "/translate",
        endpoint=handler.translate_handler,
        methods=["POST"],
    )

    hub_router.add_api_route(
        "/submitDRES",
        endpoint=handler.submit_DRES_handler,
        methods=["POST"],
    )

    hub_router.add_api_route(
        "/get_session_and_eval_id",
        endpoint=handler.get_sessionID_evalID_DRES_handler,
        methods=["GET"],
    )

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
