from fastapi import Path
from fastapi.responses import RedirectResponse, FileResponse
from http import HTTPStatus

import os
import pillow_avif
import json

# keep your existing imports
from schema.api import APIResponse
from utils.logger import get_logger
from utils.get_k_frames import get_batch as get_batch
from configs.nginx_config import NGINXConfig

from configs.app import AppConfig

logger = get_logger()
SPLIT_NAME = os.getenv("SPLIT_NAME", "autoshot")
SPLIT_NAME_LOW_RES = os.getenv("SPLIT_NAME_LOW_RES", "low_res_autoshot")


class ResultManagerHandler:
    def __init__(self) -> None:
        pass

    async def ping_handler(self) -> APIResponse:
        logger.debug("ping_handler invoked")
        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data="ping",
        )

    async def send_file_handler(self, file_path: str = Path(...)):
        logger.info("send_file_handler invoked")
        return FileResponse(file_path)

    # --- New handlers that accept video_name and frame_name only ---

    async def send_img_handler(
        self,
        video_name: str = Path(..., description="e.g. 'L27_V011'"),
        frame_name: str = Path(..., description="e.g. '03867' or '03867.avif'"),
    ):
        """
        Redirect to nginx image host for the low-res frame for given video_name and frame_name.
        Constructs path like:
        "<batch>/frames/<SPLIT_NAME>/Keyframes_L<level>/keyframes/<video_name>/<frame>.avif"
        Then replaces <SPLIT_NAME> with SPLIT_NAME_LOW_RES before redirecting.
        """
        try:
            # ensure frame file has .avif extension
            if not frame_name.lower().endswith(".avif"):
                frame_file = f"{frame_name}.avif"
            else:
                frame_file = frame_name

            # extract level number from video_name (L27_V011 -> 27)
            try:
                level_num = int(video_name.split("_")[0][1:])
            except Exception:
                raise ValueError("video_name must be in format 'Lxx_Vyyy', e.g. 'L27_V011'")

            batch = get_batch(video_name)

            # build the canonical path (using SPLIT_NAME) and then swap to low-res split
            if batch == 0:
                full_path = f"{batch}/frames/{SPLIT_NAME}/Keyframes_L{level_num}/keyframes/{video_name}/{frame_file}"
            else:
                full_path = f"{batch}/frames/{SPLIT_NAME}/Keyframes_K{level_num}/keyframes/{video_name}/{frame_file}"
            # switch to low-res split (keeps other path parts identical)
            full_path = full_path.replace(f"/{SPLIT_NAME}/", f"/{SPLIT_NAME_LOW_RES}/")

            target = f"{NGINXConfig().NGINX_IMAGE_HOST}/{full_path}"
            logger.info(f"send_img_handler redirecting to: {target}")
            return RedirectResponse(url=target, status_code=307)
        except Exception as e:
            logger.exception("failed building image redirect path")
            # raise HTTP error or return an APIResponse - adjust to your error handling style
            raise

    async def send_img_original_handler(
        self,
        video_name: str = Path(..., description="e.g. 'L27_V011'"),
        frame_name: str = Path(..., description="e.g. '03867' or '03867.avif'"),
    ):
        """
        Redirect to nginx image host for the original JPG frame.
        Builds same canonical path but returns .jpg instead of .avif.
        """
        try:
            # normalize frame base name, then switch extension to .jpg
            base = frame_name
            if base.lower().endswith(".avif") or base.lower().endswith(".jpg"):
                base = base.rsplit(".", 1)[0]

            # extract level
            try:
                level_num = int(video_name.split("_")[0][1:])
            except Exception:
                raise ValueError("video_name must be in format 'Lxx_Vyyy', e.g. 'L27_V011'")

            batch = get_batch(video_name)

            full_path = f"{batch}/frames/{SPLIT_NAME}/Keyframes_L{level_num}/keyframes/{video_name}/{base}.jpg"
            target = f"{NGINXConfig().NGINX_IMAGE_HOST}/{full_path}"
            logger.info(f"send_img_original_handler redirecting to: {target}")
            return RedirectResponse(url=target, status_code=307)
        except Exception:
            logger.exception("failed building original image redirect path")
            raise

    async def send_video_handler(
        self,
        video_name: str = Path(..., description="e.g. 'L27_V011'"),
    ):
        """
        Redirect to nginx video host for the requested video.
        Constructs: "<batch>/videos/Videos_L<level>/video/<video_name>.mp4"
        """
        try:
            # extract level
            try:
                level_num = int(video_name.split("_")[0][1:])
            except Exception:
                raise ValueError("video_name must be in format 'Lxx_Vyyy', e.g. 'L27_V011'")

            batch = get_batch(video_name)

            video_file = f"{video_name}.mp4"
            full_path = f"{batch}/videos/Videos_L{level_num}/video/{video_file}"

            target = f"{NGINXConfig().NGINX_VIDEO_HOST}/{full_path}"
            logger.info(f"send_video_handler redirecting to: {target}")
            return RedirectResponse(url=target, status_code=307)
        except Exception:
            logger.exception("failed building video redirect path")
            raise

    async def get_video_fps_handler(
        self,
        video_name: str,
    ):
        """
        video_name with or without the .mp4
        """
        try:
            with open(AppConfig().FPS_PATH[int(get_batch(video_name))], encoding='utf-8-sig') as infile:
                fps = json.load(infile)[video_name.replace(".mp4","")]
        
            logger.info(f"Got video fps: {video_name}:{fps}")
            return APIResponse(
                status=HTTPStatus.OK.value,
                message="Running (Healthy)",
                data=fps,
            )
        except Exception:
            logger.exception("failed to get video fps")
            raise