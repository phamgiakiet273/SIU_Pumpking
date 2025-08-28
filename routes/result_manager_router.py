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

from handlers.result_manager_handler import ResultManagerHandler
from utils.logger import get_logger

logger = get_logger()


def setup_router(handler: ResultManagerHandler) -> APIRouter:
    logger.info("setting up routers...")

    router = APIRouter()

    logger.info("setting up Result Manager router...")
    result_manager_router = APIRouter()

    # Health check
    result_manager_router.add_api_route(
        "/ping",
        endpoint=handler.ping_handler,
        methods=["GET"],
    )

    # return file from server -> client, direct download.
    result_manager_router.add_api_route(
        "/send_file/{file_path:path}",  # add path parameter
        endpoint=handler.send_file_handler,
        methods=["GET"],
        name="send_file"
    )
    
    result_manager_router.add_api_route(
        "/send_img/{video_name}/{frame_name}",
        endpoint=handler.send_img_handler,
        methods=["GET"],
    )
    
    result_manager_router.add_api_route(
        "/send_img_original/{video_name}/{frame_name}", 
        endpoint=handler.send_img_original_handler,
        methods=["GET"]
    )

    # Catch-all route for videos:
    result_manager_router.add_api_route(
        "/send_video/{video_name}",
        endpoint=handler.send_video_handler,
        methods=["GET"],
    )
    
    result_manager_router.add_api_route(
        "/get_fps/{video_name}",
        endpoint=handler.get_video_fps_handler,
        methods=["GET"],
    )
    
    # test request timeout
    # import asyncio
    # @router.get("/sleep")
    # async def sleep_route(seconds: int = 15):
    #     await asyncio.sleep(seconds)
    #     return {"slept": seconds}

    logger.info("Result Manager router setup successfully")

    logger.info("adding routers...")
    router.include_router(
        result_manager_router,
        prefix="/result_manager",
        tags=["SIU_Pumpking"],
    )
    logger.info("routers setup successfully")

    return router