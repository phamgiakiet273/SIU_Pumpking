import base64
import logging
import os
from http import HTTPStatus
from io import BytesIO
from typing import List, Optional, Union
import time
import ujson
import math
import colorsys

import numpy as np
from fastapi import FastAPI, Depends, HTTPException, Path
from fastapi import File, Form, UploadFile, Body
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from pathlib import Path
from schema.api import APIResponse
from schema.rerank import VideoMetadata
from utils.logger import get_logger

from configs.rerank import RerankConfig

logger = get_logger()


class RerankHandler:
    def __init__(self) -> None:
        paths = RerankConfig().RERANK_COLOR_PATH
        logger.info(f"Initializing RerankHandler with config paths: {paths}")
        self.color_dict_path = paths

    async def ping_handler(self) -> APIResponse:
        logger.info("ping_handler invoked")
        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data="ping",
        )

    def _step(self, r: float, g: float, b: float, repetitions: int = 1):
        try:
            # compute luminance and HSV ordering key
            lum = math.sqrt(0.241 * r + 0.691 * g + 0.068 * b)
            h, s, v = colorsys.rgb_to_hsv(r / 255.0, g / 255.0, b / 255.0)
            result = (
                int(h * repetitions),
                int(lum * repetitions),
                int(v * repetitions),
            )
            logger.debug(
                f"_step computed: rgb=({r}, {g}, {b}), repetitions={repetitions} => {result}"
            )
            return result
        except Exception as e:
            logger.error(f"Error in _step calculation: {e}")
            raise

    async def color_rerank(self, videos: List[VideoMetadata]) -> APIResponse:
        logger.info(f"Starting color_rerank for {len(videos)} videos")
        keyed: List[tuple] = []
        for vm in videos:
            logger.debug(
                f"Processing video: {vm.video_name} (folder idx: {vm.idx_folder}, keyframe id: {vm.keyframe_id})"
            )
            base_dir = Path(self.color_dict_path[int(vm.idx_folder)])
            json_path = (
                base_dir
                / f"Keyframes_L{vm.video_name[1:3]}"
                / f"keyframes/{vm.video_name[:-4]}"
                / f"{int(vm.keyframe_id):05d}.json"
            )
            if not json_path.exists():
                logger.error(f"Color JSON not found at path: {json_path}")
                raise HTTPException(
                    status_code=HTTPStatus.NOT_FOUND,
                    detail=f"Color JSON not found: {json_path}",
                )

            try:
                with open(json_path, "r") as f:
                    color_data = ujson.load(f)
                logger.debug(f"Loaded color JSON: {json_path}")
            except Exception as e:
                logger.error(f"Failed to load JSON from {json_path}: {e}")
                raise HTTPException(
                    status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                    detail=f"Failed to load color data: {e}",
                )

                # Normalize to list of color entries (each with "rgb")
            if isinstance(color_data, list):
                colors = color_data
            elif isinstance(color_data, dict) and "rgb" in color_data:
                colors = [color_data]
            else:
                colors = []

            if not colors:
                logger.warning(f"No colors found in data for {json_path}")

            # Sort by computed key
            try:
                colors.sort(
                    key=lambda c: self._step(*c.get("rgb", (0, 0, 0)), repetitions=8)
                )
                logger.debug(f"Sorted colors for {vm.video_name}")
            except Exception as e:
                logger.error(f"Error sorting colors: {e}")
                raise

            dominant_rgb = (
                tuple(colors[0].get("rgb", (0, 0, 0))) if colors else (0, 0, 0)
            )
            logger.debug(f"Dominant RGB for {vm.video_name}: {dominant_rgb}")

            video_key = self._step(*dominant_rgb, repetitions=8)
            keyed.append((vm, video_key))
            logger.debug(f"Video key for {vm.video_name}: {video_key}")

        # Sort videos by their color-derived key
        keyed.sort(key=lambda pair: pair[1])
        sorted_videos = [pair[0] for pair in keyed]
        logger.info("Videos sorted by dominant color key")

        # Find index of video with highest score
        try:
            max_idx = max(
                range(len(sorted_videos)), key=lambda i: float(sorted_videos[i].score)
            )
            logger.debug(f"Highest score video at sorted index: {max_idx}")
        except Exception as e:
            logger.error(f"Failed to determine max score index: {e}")
            raise

        # Cycle so that highest score video is first
        cycled = sorted_videos[max_idx:] + sorted_videos[:max_idx]
        logger.info("Cycled videos so that top score video is first")

        for idx, record in enumerate(cycled):
            record.index = idx

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Videos sorted by dominant color and cycled by top score",
            data=cycled,
        )

    async def color_rerank_handler(
        self, videos: List[VideoMetadata] = Body(...)
    ) -> APIResponse:
        logger.info("color_rerank_handler invoked")
        return await self.color_rerank(videos)
