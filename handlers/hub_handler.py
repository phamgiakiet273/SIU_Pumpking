import base64
import logging
import os
from http import HTTPStatus
from io import BytesIO
from typing import List, Optional, Union
import time
from flask import json
import ujson
import gzip
import requests
import pillow_avif

from PIL import Image
import numpy as np
from fastapi import FastAPI, Depends, HTTPException, Path, Request, Response
from fastapi import File, Form, UploadFile, Body
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import httpx
from pydantic import BaseModel

from schema.api import APIResponse
from schema.hub import ImageQuery, ScrollQuery
from schema.rerank import VideoMetadata, DetectedObject
from utils.logger import get_logger
from utils.metadata_util import (
    pil_image_to_bytes,
    get_batch,
    get_frame_path,
    get_video_path,
    convert_time_to_frame,
)
from configs.app import AppConfig
from configs.hub_config import HubConfig
from configs.METACLIP_v2_configs import METACLIPV2Config
from configs.SIGLIP_v2_configs import SIGLIPV2Config
from configs.METACLIP_configs import METACLIPConfig
from configs.rerank import RerankConfig
from configs.util import UtilConfig
from configs.nginx_config import NGINXConfig
from configs.submission import SubmissionConfig

SPLIT_NAME = os.getenv("SPLIT_NAME", "autoshot")
SPLIT_NAME_LOW_RES = os.getenv("SPLIT_NAME_LOW_RES", "low_res_autoshot")
timeout = HubConfig().REQUEST_TIMEOUT

logger = get_logger()

class HubHandler:
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

    async def send_img_handler(self, full_path: str):
        f"""
        Redirect /send_img/<full_path> → nginx at http://localhost:{NGINXConfig().NGINX_IMAGE_PORT}/img/<full_path>

        sample img input path: 0/frames/autoshot/Keyframes_L26/keyframes/L26_V264/06356.avif
        """
        full_path = full_path.replace(SPLIT_NAME, SPLIT_NAME_LOW_RES)
        target = f"{NGINXConfig().NGINX_IMAGE_HOST}/{full_path}"
        logger.info(f"send_img_handler path: {target}")
        # 307 preserves method, use 302 if you prefer
        return RedirectResponse(url=target, status_code=307)
    
    async def send_img_original_handler(self, full_path: str):
        full_path = full_path.replace('.avif', '.jpg')
        target = f"{NGINXConfig().NGINX_IMAGE_HOST}/{full_path}"
        logger.info(f"send_img_handler path: {target}")
        return RedirectResponse(url=target, status_code=307)

    async def send_video_handler(self, full_path: str):
        f"""
        Redirect /send_video/<full_path> → nginx at http://localhost:{NGINXConfig().NGINX_VIDEO_PORT}/video/<full_path>
        """
        target = f"{NGINXConfig().NGINX_VIDEO_HOST}/{full_path}"
        print(target)
        return RedirectResponse(url=target, status_code=307)

    async def rerank_color(
        self, video_metadata_list: List[VideoMetadata]
    ) -> APIResponse:
        # Convert Pydantic models to dictionaries
        video_metadata_dicts = [item.model_dump() for item in video_metadata_list]

        url = f"http://{RerankConfig().RERANK_HOST}:{RerankConfig().RERANK_PORT}/rerank/rerank_color"

        # Send the list directly without wrapping in an object
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=video_metadata_dicts)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Rerank color error: {response.text}",
            )

        json_data = ujson.loads(response.text)

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )

    async def rerank_color_handler(
        self, video_metadata_list: str = Form(...)
    ) -> APIResponse:
        try:
            # Parse the JSON string from form data
            video_metadata_list = ujson.loads(video_metadata_list)

            # Convert to Pydantic models
            video_metadata_objs = [
                VideoMetadata(**item) for item in video_metadata_list
            ]
        except Exception as e:
            logger.error(f"Error parsing video_metadata_list: {e}")
            raise HTTPException(
                status_code=400, detail=f"Invalid video_metadata_list format: {str(e)}"
            )

        return await self.rerank_color(video_metadata_objs)

    async def translate_handler(
        self,
        text: str = Form(...),
        source: Optional[str] = Form(""),
        target: Optional[str] = Form("en"),
    ) -> APIResponse:

        url = f"http://{UtilConfig().UTIL_HOST}:{UtilConfig().UTIL_PORT}/util/translate"

        json = {"text": text, "source": source, "target": target}

        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=json)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Translate error: {response.text}",
            )

        json_data = ujson.loads(response.text)
        return APIResponse(
            status=json_data.get("status", HTTPStatus.OK.value),
            message=json_data.get("message", "Translation result"),
            data=json_data.get("data"),
        )

    async def get_sessionID_evalID_DRES_handler(self) -> APIResponse:
        base_url = f"http://{SubmissionConfig().SUBMISSION_HOST}:{SubmissionConfig().SUBMISSION_PORT}/submission"
        async with httpx.AsyncClient(timeout=timeout) as client:
            # Lấy session_id
            resp1 = await client.get(f"{base_url}/get_session_id")
            if resp1.status_code != 200:
                raise HTTPException(
                    status_code=resp1.status_code,
                    detail=f"Error get_session_id: {resp1.text}",
                )
            session_id = resp1.json()["data"]["session_id"]

            # Lấy eval_id
            resp2 = await client.get(f"{base_url}/get_eval_id")
            if resp2.status_code != 200:
                raise HTTPException(
                    status_code=resp2.status_code,
                    detail=f"Error get_eval_id: {resp2.text}",
                )
            eval_id = resp2.json()["data"]["eval_id"]

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Fetched session_id and eval_id",
            data={"session_id": session_id, "eval_id": eval_id},
        )

    async def submit_DRES_handler(
        self,
        session_id: str = Form("XKHV_3XH6U-ZdlgyYrh0-YLSAkRmqCjH"),
        eval_id: str = Form("5d447f6c-472e-4df4-b569-d72325506d3c"),
        mediaItemName: str = Form("L11_V018"),
        start: int = Form(359960),
        end: int = Form(359960),
    ) -> APIResponse:

        url = f"http://{SubmissionConfig().SUBMISSION_HOST}:{SubmissionConfig().SUBMISSION_PORT}/submission/submit"
        json_data = {
            "session_id": session_id,
            "eval_id": eval_id,
            "mediaItemName": mediaItemName,
            "start": start,
            "end": end,
        }
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=json_data)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Submit error: {response.text}",
            )

        json_resp = response.json()
        return APIResponse(
            status=json_resp.get("status", HTTPStatus.OK.value),
            message=json_resp.get("message", "Submit result"),
            data=json_resp.get("data"),
        )

    async def get_neighboring_frames_handler(
        self,
        frame_num: str = Form("12977"),
        video_name: str = Form("L18_V007"),
        k: int = Form(1),
    ) -> APIResponse:
        """
        Get k frame back & forth.
        """
        url = f"http://{UtilConfig().UTIL_HOST}:{UtilConfig().UTIL_PORT}/util/get_neighboring_frames"
        payload = {"frame_num": frame_num, "video_name": video_name, "k": k}
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code, detail=f"Util error: {response.text}"
            )
        json_data = ujson.loads(response.text)
        return APIResponse(
            status=json_data.get("status", HTTPStatus.OK.value),
            message=json_data.get("message", "Result"),
            data=json_data.get("data"),
        )

    async def get_vector_of_frame_handler(
        self, video_name: str = Form("L18_V007"), frame_name: str = Form("12977")
    ) -> APIResponse:
        """Lấy vector của frame.
        Nếu đường dẫn frame hoặc collection name bị thay đổi thì sẽ bị ảnh hưởng.
        Điều kiện bắt buộc ở trên là frame truyền vô phải chắc chắn có trong database.
        """
        url = (
            f"http://{UtilConfig().UTIL_HOST}:{UtilConfig().UTIL_PORT}/util/get_vector"
        )
        payload = {"video_name": video_name, "frame_name": frame_name}
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code, detail=f"Util error: {response.text}"
            )
        json_data = ujson.loads(response.text)
        return APIResponse(
            status=json_data.get("status", HTTPStatus.OK.value),
            message=json_data.get("message", "Result"),
            data=json_data.get("data"),
        )

    async def get_video_names_of_batch_handler(
        self, batch_id: str = Form('"[0, 1]"')
    ) -> APIResponse:
        """
        Trả về danh sách tên video (không có đuôi .mp4) theo batch index truyền vào. Input ở dạng list[int]
        """
        try:
            # Accept both stringified lists and actual lists
            if isinstance(batch_id, str):
                batch_id_list = json.loads(batch_id)
            else:
                batch_id_list = batch_id
                if not isinstance(batch_id_list, list):
                    batch_id_list = [batch_id_list]
        except Exception as e:
            logger.error(f"Invalid batch_id format: {e}")
            raise HTTPException(
                status_code=400,
                detail=f"batch_id must be a JSON list of integers. Got: {batch_id}",
            )

        url = f"http://{UtilConfig().UTIL_HOST}:{UtilConfig().UTIL_PORT}/util/get_video_names"
        payload = {"batch_id": batch_id_list}
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code, detail=f"Util error: {response.text}"
            )
        json_data = ujson.loads(response.text)
        return APIResponse(
            status=json_data.get("status", HTTPStatus.OK.value),
            message=json_data.get("message", "Result"),
            data=json_data.get("data"),
        )

    # ==========================================================
    # ==========================================================
    # =====================SIGLIPv2 CODE========================
    # ==========================================================
    # ==========================================================
    async def siglip_v2_text_query_handler(
        self,
        text: str = Form(...),
        k: int = Form(100),
        video_filter: Optional[str] = Form(None),
        s2t_filter: Optional[str] = Form(None),
        return_s2t: bool = Form(True),
        return_object: bool = Form(True),
        frame_class_filter: bool = Form(True),
        skip_frames: Optional[str] = Form("[]"),
    ) -> APIResponse:

        skip_frames_list = json.loads(skip_frames)

        # prepare url + json to send to SIGLIP service
        url = f"http://{SIGLIPV2Config().SIGLIP_V2_HOST}:{SIGLIPV2Config().SIGLIP_V2_PORT}/siglip_v2/text_search"

        payload = {
            "text": str(text),
            "k": int(k),
            "video_filter": None if video_filter is None else str(video_filter),
            "s2t_filter": None if s2t_filter is None else str(s2t_filter),
            "return_s2t": return_s2t,
            "return_object": return_object,
            "frame_class_filter": frame_class_filter,
            "skip_frames": skip_frames_list if skip_frames_list else [],
        }

        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"SIGLIP text_search error: {response.text}",
            )

        json_data = ujson.loads(response.text)

        # Process/Normalize the response data b4 sending to client (easier for frontend to keep track and use)
        for idx, record in enumerate(json_data["data"]):
            record["index"] = idx
            record["video_path"] = get_video_path(
                batch=record["idx_folder"], video_name=record["video_name"]
            )
            record["video_path"] = os.path.relpath(
                record["video_path"], AppConfig().DATASET_PATH_ORIGIN
            )

            record["frame_path"] = get_frame_path(
                batch=record["idx_folder"],
                video_name=record["video_name"],
                frame_name=record["keyframe_id"],
            )
            record["frame_path"] = os.path.relpath(
                record["frame_path"], AppConfig().DATASET_PATH_TEAM
            )
            # replace the frame_path with low resolution version
            # record["frame_path"] = record["frame_path"].replace(SPLIT_NAME, SPLIT_NAME_LOW_RES)

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )

    async def siglip_v2_image_query(self, query: ImageQuery) -> APIResponse:

        url = f"http://{SIGLIPV2Config().SIGLIP_V2_HOST}:{SIGLIPV2Config().SIGLIP_V2_PORT}/siglip_v2/image_search"

        json = {
            "image_data": query.image_data,
            "k": int(query.k),
            "video_filter": None
            if query.video_filter is None
            else str(query.video_filter),
            "s2t_filter": None if query.s2t_filter is None else str(query.s2t_filter),
            "return_s2t": query.return_s2t,
            "return_object": query.return_object,
            "frame_class_filter": query.frame_class_filter,
            "skip_frames": query.skip_frames if query.skip_frames else [],
        }

        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=json)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"SIGLIP image_search error: {response.text}",
            )

        json_data = ujson.loads(response.text)

        for idx, record in enumerate(json_data["data"]):
            record["index"] = idx
            record["video_path"] = get_video_path(
                batch=record["idx_folder"], video_name=record["video_name"]
            )
            record["video_path"] = os.path.relpath(
                record["video_path"], AppConfig().DATASET_PATH_ORIGIN
            )

            record["frame_path"] = get_frame_path(
                batch=record["idx_folder"],
                video_name=record["video_name"],
                frame_name=record["keyframe_id"],
            )
            record["frame_path"] = os.path.relpath(
                record["frame_path"], AppConfig().DATASET_PATH_TEAM
            )

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )

    async def siglip_v2_image_query_handler(
        self,
        image_path: str = Form(...),
        k: int = Form(100),
        video_filter: Optional[str] = Form(None),
        s2t_filter: Optional[str] = Form(None),
        return_s2t: bool = Form(True),
        return_object: bool = Form(True),
        frame_class_filter: bool = Form(True),
        skip_frames: Optional[str] = Form("[]"),
    ) -> APIResponse:

        skip_frames_list = json.loads(skip_frames)

        try:
            if image_path.startswith("data:image/"):
                # Extract base64 data
                header, data = image_path.split(",", 1)
                image_bytes = base64.b64decode(data)
                img = Image.open(BytesIO(image_bytes))

            elif image_path.startswith(("http://", "https://")):
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.get(image_path)
                    response.raise_for_status()
                img = Image.open(BytesIO(response.content))

            else:
                img = Image.open(image_path)

            # Convert to RGB and encode
            if img.mode != "RGB":
                img = img.convert("RGB")

            buffered = BytesIO()
            img.save(buffered, format="JPEG")
            image_data = base64.b64encode(buffered.getvalue()).decode("utf-8")

        except Exception as e:
            logger.exception(f"Image loading failed: {e}")
            raise HTTPException(status_code=400, detail=f"Image loading failed: {e}")

        return await self.siglip_v2_image_query(
            ImageQuery(
                image_data=image_data,
                k=k,
                video_filter=video_filter,
                s2t_filter=s2t_filter,
                return_s2t=return_s2t,
                return_object=return_object,
                frame_class_filter=frame_class_filter,
                skip_frames=skip_frames_list,
            )
        )

    async def siglip_v2_temporal_query_handler(
        self,
        text: str = Form(...),
        k: int = Form(100),
        video_filter: Optional[str] = Form(None),
        s2t_filter: Optional[str] = Form(None),
        return_s2t: bool = Form(True),
        return_object: bool = Form(True),
        frame_class_filter: bool = Form(True),
        skip_frames: Optional[str] = Form("[]"),
    ) -> APIResponse:

        skip_frames_list = json.loads(skip_frames)

        url = f"http://{SIGLIPV2Config().SIGLIP_V2_HOST}:{SIGLIPV2Config().SIGLIP_V2_PORT}/siglip_v2/temporal_search"

        payload = {
            "text": str(text),
            "k": int(k),
            "video_filter": None if video_filter is None else str(video_filter),
            "s2t_filter": None if s2t_filter is None else str(s2t_filter),
            "return_s2t": return_s2t,
            "return_object": return_object,
            "frame_class_filter": frame_class_filter,
            "skip_frames": skip_frames_list if skip_frames_list else [],
        }

        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"SIGLIP temporal_search error: {response.text}",
            )

        json_data = ujson.loads(response.text)

        # Check if data is list of list of dicts
        if json_data["data"] and isinstance(json_data["data"][0], dict):
            # temporal mode: list[dict]
            for idx, record in enumerate(json_data["data"]):
                record["index"] = idx
                record["video_path"] = get_video_path(
                    batch=record["idx_folder"], video_name=record["video_name"]
                )
                record["video_path"] = os.path.relpath(
                    record["video_path"], AppConfig().DATASET_PATH_ORIGIN
                )
                record["frame_path"] = get_frame_path(
                    batch=record["idx_folder"],
                    video_name=record["video_name"],
                    frame_name=record["keyframe_id"],
                )
                record["frame_path"] = os.path.relpath(
                    record["frame_path"], AppConfig().DATASET_PATH_TEAM
                )
        elif json_data["data"] and isinstance(json_data["data"][0], list):
            # text mode: list[list[dict]]
            for sent_results in json_data["data"]:
                for idx, record in enumerate(sent_results):
                    record["index"] = idx
                    record["video_path"] = get_video_path(
                        batch=record["idx_folder"], video_name=record["video_name"]
                    )
                    record["video_path"] = os.path.relpath(
                        record["video_path"], AppConfig().DATASET_PATH_ORIGIN
                    )
                    record["frame_path"] = get_frame_path(
                        batch=record["idx_folder"],
                        video_name=record["video_name"],
                        frame_name=record["keyframe_id"],
                    )
                    record["frame_path"] = os.path.relpath(
                        record["frame_path"], AppConfig().DATASET_PATH_TEAM
                    )

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )

    async def siglip_v2_scroll(self, query: ScrollQuery) -> APIResponse:

        url = f"http://{SIGLIPV2Config().SIGLIP_V2_HOST}:{SIGLIPV2Config().SIGLIP_V2_PORT}/siglip_v2/scroll"

        json = {
            "k": int(query.k),
            "video_filter": str(query.video_filter),
            "s2t_filter": None if query.s2t_filter is None else str(query.s2t_filter),
            "time_in": None if query.time_in is None else str(query.time_in),
            "time_out": None if query.time_out is None else str(query.time_out),
            "return_s2t": query.return_s2t,
            "return_object": query.return_object,
            "frame_class_filter": query.frame_class_filter,
            "skip_frames": query.skip_frames if query.skip_frames else [],
        }

        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=json)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"SIGLIP scroll error: {response.text}",
            )

        json_data = ujson.loads(response.text)

        for idx, record in enumerate(json_data["data"]):
            record["index"] = idx
            record["video_path"] = get_video_path(
                batch=record["idx_folder"], video_name=record["video_name"]
            )
            record["video_path"] = os.path.relpath(
                record["video_path"], AppConfig().DATASET_PATH_ORIGIN
            )

            record["frame_path"] = get_frame_path(
                batch=record["idx_folder"],
                video_name=record["video_name"],
                frame_name=record["keyframe_id"],
            )
            record["frame_path"] = os.path.relpath(
                record["frame_path"], AppConfig().DATASET_PATH_TEAM
            )

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )

    async def siglip_v2_scroll_handler(
        self,
        k: int = Form(100),
        video_filter: Union[str] = Form(...),
        s2t_filter: Optional[str] = Form(None),
        time_in: Optional[str] = Form(None),
        time_out: Optional[str] = Form(None),
        return_s2t: bool = Form(True),
        return_object: bool = Form(True),
        frame_class_filter: bool = Form(True),
        skip_frames: Optional[str] = Form("[]"),
    ) -> APIResponse:

        skip_frames_list = json.loads(skip_frames)

        try:
            time_in = convert_time_to_frame(video_filter, time_in) if time_in else None
        except Exception as e:
            logger.error(f"Invalid time_out format: {e}")
            raise HTTPException(
                status_code=400, detail=f"Invalid time_out format: {str(e)}"
            )
        try:
            time_out = (
                convert_time_to_frame(video_filter, time_out) if time_out else None
            )
        except Exception as e:
            logger.error(f"Invalid time_out format: {e}")
            raise HTTPException(
                status_code=400, detail=f"Invalid time_out format: {str(e)}"
            )

        return await self.siglip_v2_scroll(
            ScrollQuery(
                k=k,
                video_filter=video_filter,
                s2t_filter=s2t_filter,
                time_in=time_in,
                time_out=time_out,
                return_s2t=return_s2t,
                return_object=return_object,
                frame_class_filter=frame_class_filter,
                skip_frames=skip_frames_list,
            )
        )

    # ==========================================================
    # ==========================================================
    # =====================METACLIP CODE========================
    # ==========================================================
    # ==========================================================

    async def metaclip_text_query_handler(
        self,
        text: str = Form(...),
        k: int = Form(100),
        video_filter: Optional[str] = Form(None),
        s2t_filter: Optional[str] = Form(None),
        return_s2t: bool = Form(True),
        return_object: bool = Form(True),
        frame_class_filter: bool = Form(True),
        skip_frames: Optional[str] = Form(
            '[{"video_name": "L27_V015", "frame_name": "05643", "related_start_frame": "0", "related_end_frame": "50000"}]'
        ),
    ) -> APIResponse:

        skip_frames_list = json.loads(skip_frames)

        url = f"http://{METACLIPConfig().METACLIP_HOST}:{METACLIPConfig().METACLIP_PORT}/metaclip/text_search"

        payload = {
            "text": str(text),
            "k": int(k),
            "video_filter": None if video_filter is None else str(video_filter),
            "s2t_filter": None if s2t_filter is None else str(s2t_filter),
            "return_s2t": return_s2t,
            "return_object": return_object,
            "frame_class_filter": frame_class_filter,
            "skip_frames": skip_frames_list if skip_frames_list else [],
        }

        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"SIGLIP text_search error: {response.text}",
            )

        json_data = ujson.loads(response.text)

        # Process/Normalize the response data b4 sending to client (easier for frontend to keep track and use)
        for idx, record in enumerate(json_data["data"]):
            record["index"] = idx
            record["video_path"] = get_video_path(
                batch=record["idx_folder"], video_name=record["video_name"]
            )
            record["video_path"] = os.path.relpath(
                record["video_path"], AppConfig().DATASET_PATH_ORIGIN
            )

            record["frame_path"] = get_frame_path(
                batch=record["idx_folder"],
                video_name=record["video_name"],
                frame_name=record["keyframe_id"],
            )
            record["frame_path"] = os.path.relpath(
                record["frame_path"], AppConfig().DATASET_PATH_TEAM
            )
            # replace the frame_path with low resolution version
            # record["frame_path"] = record["frame_path"].replace(SPLIT_NAME, SPLIT_NAME_LOW_RES)

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )

    async def metaclip_image_query(self, query: ImageQuery) -> APIResponse:

        url = f"http://{METACLIPConfig().METACLIP_HOST}:{METACLIPConfig().METACLIP_PORT}/metaclip/image_search"

        json = {
            "image_data": query.image_data,
            "k": int(query.k),
            "video_filter": None
            if query.video_filter is None
            else str(query.video_filter),
            "s2t_filter": None if query.s2t_filter is None else str(query.s2t_filter),
            "return_s2t": query.return_s2t,
            "return_object": query.return_object,
            "frame_class_filter": query.frame_class_filter,
            "skip_frames": query.skip_frames if query.skip_frames else [],
        }

        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=json)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"SIGLIP image_search error: {response.text}",
            )

        json_data = ujson.loads(response.text)

        for idx, record in enumerate(json_data["data"]):
            record["index"] = idx
            record["video_path"] = get_video_path(
                batch=record["idx_folder"], video_name=record["video_name"]
            )
            record["video_path"] = os.path.relpath(
                record["video_path"], AppConfig().DATASET_PATH_ORIGIN
            )

            record["frame_path"] = get_frame_path(
                batch=record["idx_folder"],
                video_name=record["video_name"],
                frame_name=record["keyframe_id"],
            )
            record["frame_path"] = os.path.relpath(
                record["frame_path"], AppConfig().DATASET_PATH_TEAM
            )

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )

    async def metaclip_image_query_handler(
        self,
        image_path: str = Form(...),
        k: int = Form(100),
        video_filter: Optional[str] = Form(None),
        s2t_filter: Optional[str] = Form(None),
        return_s2t: bool = Form(True),
        return_object: bool = Form(True),
        frame_class_filter: bool = Form(True),
        skip_frames: Optional[str] = Form("[]"),
    ) -> APIResponse:

        skip_frames_list = json.loads(skip_frames)

        try:
            if image_path.startswith("data:image/"):
                # Extract base64 data
                header, data = image_path.split(",", 1)
                image_bytes = base64.b64decode(data)
                img = Image.open(BytesIO(image_bytes))

            elif image_path.startswith(("http://", "https://")):
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.get(image_path)
                    response.raise_for_status()
                img = Image.open(BytesIO(response.content))

            else:
                img = Image.open(image_path)

            # Convert to RGB and encode
            if img.mode != "RGB":
                img = img.convert("RGB")

            buffered = BytesIO()
            img.save(buffered, format="JPEG")
            image_data = base64.b64encode(buffered.getvalue()).decode("utf-8")

        except Exception as e:
            logger.exception(f"Image loading failed: {e}")
            raise HTTPException(status_code=400, detail=f"Image loading failed: {e}")

        return await self.metaclip_image_query(
            ImageQuery(
                image_data=image_data,
                k=k,
                video_filter=video_filter,
                s2t_filter=s2t_filter,
                return_s2t=return_s2t,
                return_object=return_object,
                frame_class_filter=frame_class_filter,
                skip_frames=skip_frames_list,
            )
        )

    async def metaclip_temporal_query_handler(
        self,
        text: str = Form(...),
        k: int = Form(100),
        video_filter: Optional[str] = Form(None),
        s2t_filter: Optional[str] = Form(None),
        return_list: bool = Form(False),
        return_s2t: bool = Form(True),
        return_object: bool = Form(True),
        frame_class_filter: bool = Form(True),
        skip_frames: Optional[str] = Form("[]"),
    ) -> APIResponse:

        skip_frames_list = json.loads(skip_frames)

        url = f"http://{METACLIPConfig().METACLIP_HOST}:{METACLIPConfig().METACLIP_PORT}/metaclip/temporal_search"

        payload = {
            "text": str(text),
            "k": int(k),
            "video_filter": None if video_filter is None else str(video_filter),
            "s2t_filter": None if s2t_filter is None else str(s2t_filter),
            "return_s2t": return_s2t,
            "return_object": return_object,
            "frame_class_filter": frame_class_filter,
            "skip_frames": skip_frames_list if skip_frames_list else [],
        }

        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"SIGLIP temporal_search error: {response.text}",
            )

        json_data = ujson.loads(response.text)

        # Check if data is list of list of dicts
        if json_data["data"] and isinstance(json_data["data"][0], dict):
            # temporal mode: list[dict]
            for idx, record in enumerate(json_data["data"]):
                record["index"] = idx
                record["video_path"] = get_video_path(
                    batch=record["idx_folder"], video_name=record["video_name"]
                )
                record["video_path"] = os.path.relpath(
                    record["video_path"], AppConfig().DATASET_PATH_ORIGIN
                )
                record["frame_path"] = get_frame_path(
                    batch=record["idx_folder"],
                    video_name=record["video_name"],
                    frame_name=record["keyframe_id"],
                )
                record["frame_path"] = os.path.relpath(
                    record["frame_path"], AppConfig().DATASET_PATH_TEAM
                )
        elif json_data["data"] and isinstance(json_data["data"][0], list):
            # text mode: list[list[dict]]
            for sent_results in json_data["data"]:
                for idx, record in enumerate(sent_results):
                    record["index"] = idx
                    record["video_path"] = get_video_path(
                        batch=record["idx_folder"], video_name=record["video_name"]
                    )
                    record["video_path"] = os.path.relpath(
                        record["video_path"], AppConfig().DATASET_PATH_ORIGIN
                    )
                    record["frame_path"] = get_frame_path(
                        batch=record["idx_folder"],
                        video_name=record["video_name"],
                        frame_name=record["keyframe_id"],
                    )
                    record["frame_path"] = os.path.relpath(
                        record["frame_path"], AppConfig().DATASET_PATH_TEAM
                    )

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )

    async def metaclip_scroll(self, query: ScrollQuery) -> APIResponse:

        url = f"http://{METACLIPConfig().METACLIP_HOST}:{METACLIPConfig().METACLIP_PORT}/metaclip/scroll"

        json = {
            "k": int(query.k),
            "video_filter": str(query.video_filter),
            "s2t_filter": None if query.s2t_filter is None else str(query.s2t_filter),
            "time_in": None if query.time_in is None else str(query.time_in),
            "time_out": None if query.time_out is None else str(query.time_out),
            "return_s2t": query.return_s2t,
            "return_object": query.return_object,
            "frame_class_filter": query.frame_class_filter,
            "skip_frames": query.skip_frames if query.skip_frames else [],
        }

        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=json)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"SIGLIP scroll error: {response.text}",
            )

        json_data = ujson.loads(response.text)

        for idx, record in enumerate(json_data["data"]):
            record["index"] = idx
            record["video_path"] = get_video_path(
                batch=record["idx_folder"], video_name=record["video_name"]
            )
            record["video_path"] = os.path.relpath(
                record["video_path"], AppConfig().DATASET_PATH_ORIGIN
            )

            record["frame_path"] = get_frame_path(
                batch=record["idx_folder"],
                video_name=record["video_name"],
                frame_name=record["keyframe_id"],
            )
            record["frame_path"] = os.path.relpath(
                record["frame_path"], AppConfig().DATASET_PATH_TEAM
            )

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )

    async def metaclip_scroll_handler(
        self,
        k: int = Form(100),
        video_filter: Union[str] = Form(...),
        s2t_filter: Optional[str] = Form(None),
        time_in: Optional[str] = Form(None),
        time_out: Optional[str] = Form(None),
        return_s2t=Form(True),
        return_object=Form(True),
        frame_class_filter: bool = Form(True),
        skip_frames: Optional[str] = Form("[]"),
    ) -> APIResponse:

        skip_frames_list = json.loads(skip_frames)

        try:
            time_in = convert_time_to_frame(video_filter, time_in) if time_in else None
        except Exception as e:
            logger.error(f"Invalid time_out format: {e}")
            raise HTTPException(
                status_code=400, detail=f"Invalid time_out format: {str(e)}"
            )
        try:
            time_out = (
                convert_time_to_frame(video_filter, time_out) if time_out else None
            )
        except Exception as e:
            logger.error(f"Invalid time_out format: {e}")
            raise HTTPException(
                status_code=400, detail=f"Invalid time_out format: {str(e)}"
            )

        return await self.metaclip_scroll(
            ScrollQuery(
                k=k,
                video_filter=video_filter,
                s2t_filter=s2t_filter,
                time_in=time_in,
                time_out=time_out,
                return_s2t=return_s2t,
                return_object=return_object,
                frame_class_filter=frame_class_filter,
                skip_frames=skip_frames_list,
            )
        )

    # ==========================================================
    # ==========================================================
    # =====================METACLIPv2 CODE========================
    # ==========================================================
    # ==========================================================

    async def metaclip_v2_text_query_handler(
        self,
        text: str = Form(...),
        k: int = Form(100),
        video_filter: Optional[str] = Form(None),
        s2t_filter: Optional[str] = Form(None),
        return_s2t: bool = Form(True),
        return_object: bool = Form(True),
        frame_class_filter: bool = Form(True),
        skip_frames: Optional[str] = Form(
            '[{"video_name": "L27_V015", "frame_name": "05643", "related_start_frame": "0", "related_end_frame": "50000"}]'
        ),
    ) -> APIResponse:

        skip_frames_list = json.loads(skip_frames)

        url = f"http://{METACLIPV2Config().METACLIP_V2_HOST}:{METACLIPV2Config().METACLIP_V2_PORT}/metaclip_v2/text_search"

        payload = {
            "text": str(text),
            "k": int(k),
            "video_filter": None if video_filter is None else str(video_filter),
            "s2t_filter": None if s2t_filter is None else str(s2t_filter),
            "return_s2t": return_s2t,
            "return_object": return_object,
            "frame_class_filter": frame_class_filter,
            "skip_frames": skip_frames_list if skip_frames_list else [],
        }

        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"SIGLIP text_search error: {response.text}",
            )

        json_data = ujson.loads(response.text)

        # Process/Normalize the response data b4 sending to client (easier for frontend to keep track and use)
        for idx, record in enumerate(json_data["data"]):
            record["index"] = idx
            record["video_path"] = get_video_path(
                batch=record["idx_folder"], video_name=record["video_name"]
            )
            record["video_path"] = os.path.relpath(
                record["video_path"], AppConfig().DATASET_PATH_ORIGIN
            )

            record["frame_path"] = get_frame_path(
                batch=record["idx_folder"],
                video_name=record["video_name"],
                frame_name=record["keyframe_id"],
            )
            record["frame_path"] = os.path.relpath(
                record["frame_path"], AppConfig().DATASET_PATH_TEAM
            )
            # replace the frame_path with low resolution version
            # record["frame_path"] = record["frame_path"].replace(SPLIT_NAME, SPLIT_NAME_LOW_RES)

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )

    async def metaclip_v2_image_query(self, query: ImageQuery) -> APIResponse:

        url = f"http://{METACLIPV2Config().METACLIP_V2_HOST}:{METACLIPV2Config().METACLIP_V2_PORT}/metaclip_v2/image_search"

        json = {
            "image_data": query.image_data,
            "k": int(query.k),
            "video_filter": None
            if query.video_filter is None
            else str(query.video_filter),
            "s2t_filter": None if query.s2t_filter is None else str(query.s2t_filter),
            "return_s2t": query.return_s2t,
            "return_object": query.return_object,
            "frame_class_filter": query.frame_class_filter,
            "skip_frames": query.skip_frames if query.skip_frames else [],
        }

        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=json)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"SIGLIP image_search error: {response.text}",
            )

        json_data = ujson.loads(response.text)

        for idx, record in enumerate(json_data["data"]):
            record["index"] = idx
            record["video_path"] = get_video_path(
                batch=record["idx_folder"], video_name=record["video_name"]
            )
            record["video_path"] = os.path.relpath(
                record["video_path"], AppConfig().DATASET_PATH_ORIGIN
            )

            record["frame_path"] = get_frame_path(
                batch=record["idx_folder"],
                video_name=record["video_name"],
                frame_name=record["keyframe_id"],
            )
            record["frame_path"] = os.path.relpath(
                record["frame_path"], AppConfig().DATASET_PATH_TEAM
            )

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )

    async def metaclip_v2_image_query_handler(
        self,
        image_path: str = Form(...),
        k: int = Form(100),
        video_filter: Optional[str] = Form(None),
        s2t_filter: Optional[str] = Form(None),
        return_s2t: bool = Form(True),
        return_object: bool = Form(True),
        frame_class_filter: bool = Form(True),
        skip_frames: Optional[str] = Form("[]"),
    ) -> APIResponse:

        skip_frames_list = json.loads(skip_frames)

        try:
            if image_path.startswith("data:image/"):
                # Extract base64 data
                header, data = image_path.split(",", 1)
                image_bytes = base64.b64decode(data)
                img = Image.open(BytesIO(image_bytes))

            elif image_path.startswith(("http://", "https://")):
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.get(image_path)
                    response.raise_for_status()
                img = Image.open(BytesIO(response.content))

            else:
                img = Image.open(image_path)

            # Convert to RGB and encode
            if img.mode != "RGB":
                img = img.convert("RGB")

            buffered = BytesIO()
            img.save(buffered, format="JPEG")
            image_data = base64.b64encode(buffered.getvalue()).decode("utf-8")

        except Exception as e:
            logger.exception(f"Image loading failed: {e}")
            raise HTTPException(status_code=400, detail=f"Image loading failed: {e}")

        return await self.metaclip_v2_image_query(
            ImageQuery(
                image_data=image_data,
                k=k,
                video_filter=video_filter,
                s2t_filter=s2t_filter,
                return_s2t=return_s2t,
                return_object=return_object,
                frame_class_filter=frame_class_filter,
                skip_frames=skip_frames_list,
            )
        )

    async def metaclip_v2_temporal_query_handler(
        self,
        text: str = Form(...),
        k: int = Form(100),
        video_filter: Optional[str] = Form(None),
        s2t_filter: Optional[str] = Form(None),
        return_list: bool = Form(False),
        return_s2t: bool = Form(True),
        return_object: bool = Form(True),
        frame_class_filter: bool = Form(True),
        skip_frames: Optional[str] = Form("[]"),
    ) -> APIResponse:

        skip_frames_list = json.loads(skip_frames)

        url = f"http://{METACLIPV2Config().METACLIP_V2_HOST}:{METACLIPV2Config().METACLIP_V2_PORT}/metaclip_v2/temporal_search"

        payload = {
            "text": str(text),
            "k": int(k),
            "video_filter": None if video_filter is None else str(video_filter),
            "s2t_filter": None if s2t_filter is None else str(s2t_filter),
            "return_s2t": return_s2t,
            "return_object": return_object,
            "frame_class_filter": frame_class_filter,
            "skip_frames": skip_frames_list if skip_frames_list else [],
        }

        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"SIGLIP temporal_search error: {response.text}",
            )

        json_data = ujson.loads(response.text)

        # Check if data is list of list of dicts
        if json_data["data"] and isinstance(json_data["data"][0], dict):
            # temporal mode: list[dict]
            for idx, record in enumerate(json_data["data"]):
                record["index"] = idx
                record["video_path"] = get_video_path(
                    batch=record["idx_folder"], video_name=record["video_name"]
                )
                record["video_path"] = os.path.relpath(
                    record["video_path"], AppConfig().DATASET_PATH_ORIGIN
                )
                record["frame_path"] = get_frame_path(
                    batch=record["idx_folder"],
                    video_name=record["video_name"],
                    frame_name=record["keyframe_id"],
                )
                record["frame_path"] = os.path.relpath(
                    record["frame_path"], AppConfig().DATASET_PATH_TEAM
                )
        elif json_data["data"] and isinstance(json_data["data"][0], list):
            # text mode: list[list[dict]]
            for sent_results in json_data["data"]:
                for idx, record in enumerate(sent_results):
                    record["index"] = idx
                    record["video_path"] = get_video_path(
                        batch=record["idx_folder"], video_name=record["video_name"]
                    )
                    record["video_path"] = os.path.relpath(
                        record["video_path"], AppConfig().DATASET_PATH_ORIGIN
                    )
                    record["frame_path"] = get_frame_path(
                        batch=record["idx_folder"],
                        video_name=record["video_name"],
                        frame_name=record["keyframe_id"],
                    )
                    record["frame_path"] = os.path.relpath(
                        record["frame_path"], AppConfig().DATASET_PATH_TEAM
                    )

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )

    async def metaclip_v2_scroll(self, query: ScrollQuery) -> APIResponse:

        url = f"http://{METACLIPV2Config().METACLIP_V2_HOST}:{METACLIPV2Config().METACLIP_V2_PORT}/metaclip_v2/scroll"

        json = {
            "k": int(query.k),
            "video_filter": str(query.video_filter),
            "s2t_filter": None if query.s2t_filter is None else str(query.s2t_filter),
            "time_in": None if query.time_in is None else str(query.time_in),
            "time_out": None if query.time_out is None else str(query.time_out),
            "return_s2t": query.return_s2t,
            "return_object": query.return_object,
            "frame_class_filter": query.frame_class_filter,
            "skip_frames": query.skip_frames if query.skip_frames else [],
        }

        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=json)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"SIGLIP scroll error: {response.text}",
            )

        json_data = ujson.loads(response.text)

        for idx, record in enumerate(json_data["data"]):
            record["index"] = idx
            record["video_path"] = get_video_path(
                batch=record["idx_folder"], video_name=record["video_name"]
            )
            record["video_path"] = os.path.relpath(
                record["video_path"], AppConfig().DATASET_PATH_ORIGIN
            )

            record["frame_path"] = get_frame_path(
                batch=record["idx_folder"],
                video_name=record["video_name"],
                frame_name=record["keyframe_id"],
            )
            record["frame_path"] = os.path.relpath(
                record["frame_path"], AppConfig().DATASET_PATH_TEAM
            )

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )

    async def metaclip_v2_scroll_handler(
        self,
        k: int = Form(100),
        video_filter: Union[str] = Form(...),
        s2t_filter: Optional[str] = Form(None),
        time_in: Optional[str] = Form(None),
        time_out: Optional[str] = Form(None),
        return_s2t=Form(True),
        return_object=Form(True),
        frame_class_filter: bool = Form(True),
        skip_frames: Optional[str] = Form("[]"),
    ) -> APIResponse:

        skip_frames_list = json.loads(skip_frames)

        try:
            time_in = convert_time_to_frame(video_filter, time_in) if time_in else None
        except Exception as e:
            logger.error(f"Invalid time_out format: {e}")
            raise HTTPException(
                status_code=400, detail=f"Invalid time_out format: {str(e)}"
            )
        try:
            time_out = (
                convert_time_to_frame(video_filter, time_out) if time_out else None
            )
        except Exception as e:
            logger.error(f"Invalid time_out format: {e}")
            raise HTTPException(
                status_code=400, detail=f"Invalid time_out format: {str(e)}"
            )

        return await self.metaclip_v2_scroll(
            ScrollQuery(
                k=k,
                video_filter=video_filter,
                s2t_filter=s2t_filter,
                time_in=time_in,
                time_out=time_out,
                return_s2t=return_s2t,
                return_object=return_object,
                frame_class_filter=frame_class_filter,
                skip_frames=skip_frames_list,
            )
        )
