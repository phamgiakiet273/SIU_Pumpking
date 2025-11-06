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
import imghdr
import pillow_avif

from PIL import Image
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
from utils.metadata_util import pil_image_to_bytes, get_batch, get_frame_path, get_video_path, convert_time_to_frame
from configs.app import AppConfig
from configs.hub_config import HubConfig
from configs.util import UtilConfig
from configs.nginx_config import NGINXConfig

from handlers.submission_handler import SubmissionHandler

from asyncio import create_task, sleep

SPLIT_NAME = os.getenv("SPLIT_NAME", "autoshot")
SPLIT_NAME_LOW_RES = os.getenv("SPLIT_NAME_LOW_RES", "low_res_autoshot")
timeout = HubConfig().REQUEST_TIMEOUT

logger = get_logger()

class HubHandler:
    def __init__(self) -> None:
        self.session_id = None  # Global variable for session_id
        self.eval_id = None     # Global variable for eval_id
        create_task(self.update_session_and_eval_ids())  # Start the background task

    async def update_session_and_eval_ids(self):
        """Background task to update session_id and eval_id every 300 seconds."""
        while True:
            try:
                session_id, eval_id = await self.get_sessionID_evalID_DRES_handler()
                self.session_id = session_id
                self.eval_id = eval_id
                logger.info(f"Updated session_id: {self.session_id}, eval_id: {self.eval_id}")
            except Exception as e:
                logger.error(f"Failed to update session_id and eval_id: {e}")
            await sleep(300)  # Wait for 300 seconds before the next update

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
        return RedirectResponse(url=target, status_code=307)
    
    async def send_img_original_handler(self, full_path: str):
        full_path = full_path.replace(SPLIT_NAME_LOW_RES, SPLIT_NAME)
        full_path = full_path.replace('.avif', '.jpg')
        target = f"{NGINXConfig().NGINX_IMAGE_HOST}/{full_path}"
        logger.info(f"send_ORIGINAL_img_handler path: {target}")
        return RedirectResponse(url=target, status_code=307)

    async def send_video_handler(self, full_path: str):
        f"""
        Redirect /send_video/<full_path> → nginx at http://localhost:{NGINXConfig().NGINX_VIDEO_PORT}/video/<full_path>
        """
        #full_path = full_path.replace(SPLIT_NAME_LOW_RES, SPLIT_NAME)
        target = f"{NGINXConfig().NGINX_VIDEO_HOST}/{full_path}"
        logger.info(f"send_video_handler path: {target}")
        return RedirectResponse(url=target, status_code=307)
    
    # async def send_video_original_handler(self, full_path: str):
    #     target = f"{NGINXConfig().NGINX_VIDEO_HOST}/{full_path}"
    #     logger.info(f"send_video_original_handler path: {target}")
    #     return RedirectResponse(url=target, status_code=307)
    
    async def rerank_color(self, video_metadata_list: List[VideoMetadata]) -> APIResponse:
        # Convert Pydantic models to dictionaries
        video_metadata_dicts = [item.model_dump() for item in video_metadata_list]
        
        url = f"{HubConfig().RERANK_HOST_PUBLIC}/rerank/rerank_color"
        
        # Send the list directly without wrapping in an object
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=video_metadata_dicts)
            
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Rerank color error: {response.text}")
        
        json_data = ujson.loads(response.text)

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )
        
    async def rerank_color_handler(self, video_metadata_list: str = Form(...)) -> APIResponse:
        try:
            # Parse the JSON string from form data
            video_metadata_list = ujson.loads(video_metadata_list)
            
            # Convert to Pydantic models
            video_metadata_objs = [VideoMetadata(**item) for item in video_metadata_list]
        except Exception as e:
            logger.error(f"Error parsing video_metadata_list: {e}")
            raise HTTPException(
                status_code=400,
                detail=f"Invalid video_metadata_list format: {str(e)}"
            )
        
        return await self.rerank_color(video_metadata_objs)
        
    async def translate_handler(self, text: str = Form(...),
                              source: Optional[str] = Form(""),
                              target: Optional[str] = Form("en")) -> APIResponse:
        
        url = f"{HubConfig().UTIL_HOST_PUBLIC}/util/translate"
        
        json = {
            "text": text,
            "source": source,
            "target": target
        }
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json = json)
            
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Translate error: {response.text}")
        
        json_data = ujson.loads(response.text)
        return APIResponse(
            status=json_data.get("status", HTTPStatus.OK.value),
            message=json_data.get("message", "Translation result"),
            data=json_data.get("data")
        )
       
    async def get_sessionID_evalID_DRES_handler(self) -> tuple:
        base_url = f"{HubConfig().SUBMISSION_HOST_PUBLIC}/submission"
        
        # EXPERIMENT: auto relogin in case session expired
        async with httpx.AsyncClient(timeout=timeout) as client:
            relogin_response = await client.get(f"{base_url}/relogin")
            if relogin_response.status_code != 200:
                raise HTTPException(
                    status_code=relogin_response.status_code,
                    detail=f"Re-login failed: {relogin_response.text}"
                )
            # relogin_data = relogin_response.json()
            # logger.info(f"Re-login successful: {relogin_data}")
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            # Lấy session_id
            resp1 = await client.get(f"{base_url}/get_session_id")
            if resp1.status_code != 200:
                raise HTTPException(status_code=resp1.status_code, detail=f"Error get_session_id: {resp1.text}")
            session_id = resp1.json()["data"]["session_id"]

            # Lấy eval_id
            resp2 = await client.get(f"{base_url}/get_eval_id")
            if resp2.status_code != 200:
                raise HTTPException(status_code=resp2.status_code, detail=f"Error get_eval_id: {resp2.text}")
            eval_id = resp2.json()["data"]["eval_id"]

        return session_id, eval_id
        
    async def submit_KIS_handler(self, 
                                mediaItemName: str = Form("K19_V006"),
                                start: int = Form(1046169),
                                end: int = Form(1046169)
                            ) -> APIResponse:
        
        #url = f"http://{SubmissionConfig().SUBMISSION_HOST}:{SubmissionConfig().SUBMISSION_PORT}/submission/submit"
        session_id, eval_id = self.session_id, self.eval_id
        logger.info(f"\n\nsession_id: {session_id}, eval_id: {eval_id}\n\n")
        
        url = f"{HubConfig().SUBMISSION_HOST_PUBLIC}/submission/submit_kis"
        json_data = {
            "session_id": session_id,
            "eval_id": eval_id,
            "mediaItemName": mediaItemName,
            "start": start,
            "end": end
        }
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=json_data)
            
        if response.status_code != 200:
            # --- REFACTORED PART ---
            # The first API (submit_kis_handler) already raised an HTTPException.
            # We'll try to parse its JSON response to get the 'detail' field.
            error_message = response.text # Default fallback
            try:
                error_data = response.json()
                # The 'detail' field from the HTTPException is what we want
                specific_detail = error_data.get("detail") 
                if specific_detail:
                    error_message = specific_detail
                    logger.error(f"Submit KIS error detail: {error_message}")
            except Exception:
                # Not a JSON response, just use the raw text
                pass
                
            raise HTTPException(status_code=response.status_code, detail=error_message)
        
        json_resp = response.json()
        return APIResponse(
            status=json_resp.get("status", HTTPStatus.OK.value),
            message=json_resp.get("message", "Submit result"),
            data=json_resp.get("data")
        ) 
        
    async def submit_QA_handler(self, 
                                answer: str = Form("?"),
                                video_id: str = Form("L11_V018"),
                                time: str = Form("359960"),
                            ) -> APIResponse:
        
        #url = f"http://{SubmissionConfig().SUBMISSION_HOST}:{SubmissionConfig().SUBMISSION_PORT}/submission/submit"
        session_id, eval_id = self.session_id, self.eval_id
        logger.info(f"\n\nsession_id: {session_id}, eval_id: {eval_id}\n\n")
        
        url = f"{HubConfig().SUBMISSION_HOST_PUBLIC}/submission/submit_qa"
        json_data = {
            "session_id": session_id,
            "eval_id": eval_id,
            "answer": answer,
            "video_id": video_id,
            "time": time
        }
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=json_data)
            
        if response.status_code != 200:
            error_message = response.text # Default fallback
            try:
                error_data = response.json()
                specific_detail = error_data.get("detail") 
                if specific_detail:
                    error_message = specific_detail
                    logger.error(f"Submit QA error detail: {error_message}")
            except Exception:
                pass
                
            raise HTTPException(status_code=response.status_code, detail=error_message)
        
        json_resp = response.json()
        return APIResponse(
            status=json_resp.get("status", HTTPStatus.OK.value),
            message=json_resp.get("message", "Submit result"),
            data=json_resp.get("data")
        )
        
    async def submit_TRAKE_handler(self, 
                                video_id: str = Form("L11_V018"),
                                frame_ids: str = Form("?")
                            ) -> APIResponse:
        
        #url = f"http://{SubmissionConfig().SUBMISSION_HOST}:{SubmissionConfig().SUBMISSION_PORT}/submission/submit"
        session_id, eval_id = self.session_id, self.eval_id
        logger.info(f"\n\nsession_id: {session_id}, eval_id: {eval_id}\n\n")
        
        url = f"{HubConfig().SUBMISSION_HOST_PUBLIC}/submission/submit_trake"
        json_data = {
            "session_id": session_id,
            "eval_id": eval_id,
            "video_id": video_id,
            "frame_ids": frame_ids
        }
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=json_data)
            
        if response.status_code != 200:
            error_message = response.text # Default fallback
            try:
                error_data = response.json()
                specific_detail = error_data.get("detail") 
                if specific_detail:
                    error_message = specific_detail
                    logger.error(f"Submit TRAKE error detail: {error_message}")
            except Exception:
                pass
                
            raise HTTPException(status_code=response.status_code, detail=error_message)
        
        json_resp = response.json()
        return APIResponse(
            status=json_resp.get("status", HTTPStatus.OK.value),
            message=json_resp.get("message", "Submit result"),
            data=json_resp.get("data")
        )

    async def get_neighboring_frames_handler(self,
                                             frame_num: str = Form("12977"),
                                             video_name: str = Form("L18_V007"),
                                             k: int = Form(1)) -> APIResponse:
        """
        Get k frame back & forth.
        """
        
        # Pad frame_num to length 5 with leading zeros
        if len(frame_num) < 5:
            frame_num = frame_num.zfill(5)
        
        url = f"{HubConfig().UTIL_HOST_PUBLIC}/util/get_neighboring_frames"
        payload = {
            "frame_num": frame_num,
            "video_name": video_name,
            "k": k
        }
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Util error: {response.text}")
        json_data = ujson.loads(response.text)
        return APIResponse(
            status=json_data.get("status", HTTPStatus.OK.value),
            message=json_data.get("message", "Result"),
            data=json_data.get("data")
        )
        
    async def get_vector_of_frame_handler(self,
                                        video_name: str = Form("L18_V007"),
                                        frame_name: str = Form("12977"))-> APIResponse:
        """Lấy vector của frame.
            Nếu đường dẫn frame hoặc collection name bị thay đổi thì sẽ bị ảnh hưởng.
            Điều kiện bắt buộc ở trên là frame truyền vô phải chắc chắn có trong database.
        """
        url = f"{HubConfig().UTIL_HOST_PUBLIC}/util/get_vector"
        payload = {
            "video_name": video_name,
            "frame_name": frame_name
        }
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Util error: {response.text}")
        json_data = ujson.loads(response.text)
        return APIResponse(
            status=json_data.get("status", HTTPStatus.OK.value),
            message=json_data.get("message", "Result"),
            data=json_data.get("data")
        )
        
    async def get_video_names_of_batch_handler(self,
                                        batch_id: str = Form('"[0, 1]"'))-> APIResponse:
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
            raise HTTPException(status_code=400, detail=f"batch_id must be a JSON list of integers. Got: {batch_id}")
        
        url = f"{HubConfig().UTIL_HOST_PUBLIC}/util/get_video_names"
        payload = {
            "batch_id": batch_id_list
        }
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Util error: {response.text}")
        json_data = ujson.loads(response.text)
        return APIResponse(
            status=json_data.get("status", HTTPStatus.OK.value),
            message=json_data.get("message", "Result"),
            data=json_data.get("data")
        )
        
#==========================================================
#==========================================================   
#=====================SIGLIPv2 CODE========================
#==========================================================
#==========================================================
    async def siglip_v2_text_query_handler(self, text: str = Form(...),
                                        k: int = Form(100),
                                        video_filter: Optional[str] = Form(None),
                                        s2t_filter: Optional[str] = Form(None),
                                        return_s2t: bool = Form(True), 
                                        return_object: bool = Form(True),
                                        frame_class_filter: Optional[str] = Form('[]'),
                                        skip_frames: Optional[str] = Form('[]'),
                                        sort_to_news: bool = Form(True)) -> APIResponse:
        
        frame_class_filter = json.loads(frame_class_filter)
        skip_frames_list = json.loads(skip_frames)
        
        #prepare url + json to send to SIGLIP service
        #url = f"http://{SIGLIPV2Config().SIGLIP_V2_HOST}:{SIGLIPV2Config().SIGLIP_V2_PORT}/siglip_v2/text_search"
        url = f"{HubConfig().SIGLIP_V2_HOST_PUBLIC}/siglip_alpha/text_search"
        
        payload = {
            "text": str(text),
            "k": int(k),
            "video_filter": None if video_filter is None else str(video_filter),
            "s2t_filter": None if s2t_filter is None else str(s2t_filter),
            "return_s2t": return_s2t,
            "return_object": return_object,
            "frame_class_filter": frame_class_filter,
            "skip_frames": skip_frames_list if skip_frames_list else [],
            "sort_to_news": sort_to_news,
        }
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)
            
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"SIGLIP text_search error: {response.text}")
        
        json_data = ujson.loads(response.text)

        # Process/Normalize the response data b4 sending to client (easier for frontend to keep track and use)
        for idx, record in enumerate(json_data["data"]):
            record["index"] = idx
            record["video_path"] = get_video_path(batch = record["idx_folder"],
                                                  video_name = record["video_name"])
            record["video_path"] = os.path.relpath(record["video_path"], AppConfig().DATASET_PATH_ORIGIN)
            
            record["frame_path"] = get_frame_path(batch = record["idx_folder"],
                                                  video_name = record["video_name"],
                                                  frame_name = record["keyframe_id"])
            record["frame_path"] = os.path.relpath(record["frame_path"], AppConfig().DATASET_PATH_TEAM)
            # replace the frame_path with low resolution version
            #record["frame_path"] = record["frame_path"].replace(SPLIT_NAME, SPLIT_NAME_LOW_RES)

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )

    async def siglip_v2_image_query(self, query: ImageQuery) -> APIResponse:
        
        #url = f"http://{SIGLIPV2Config().SIGLIP_V2_HOST}:{SIGLIPV2Config().SIGLIP_V2_PORT}/siglip_v2/image_search"
        url = f"{HubConfig().SIGLIP_V2_HOST_PUBLIC}/siglip_alpha/image_search"
        
        json = {
            "image_data": query.image_data,
            "k": int(query.k),
            "video_filter": None if query.video_filter is None else str(query.video_filter),
            "s2t_filter": None if query.s2t_filter is None else str(query.s2t_filter),
            "return_s2t": query.return_s2t,
            "return_object": query.return_object,
            "frame_class_filter": query.frame_class_filter,
            "skip_frames": query.skip_frames if query.skip_frames else [],
            "sort_to_news": query.sort_to_news,
        }
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json = json)
            
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"SIGLIP image_search error: {response.text}")
        
        json_data = ujson.loads(response.text)

        for idx, record in enumerate(json_data["data"]):
            record["index"] = idx
            record["video_path"] = get_video_path(batch = record["idx_folder"],
                                                  video_name = record["video_name"])
            record["video_path"] = os.path.relpath(record["video_path"], AppConfig().DATASET_PATH_ORIGIN)
            
            record["frame_path"] = get_frame_path(batch = record["idx_folder"],
                                                  video_name = record["video_name"],
                                                  frame_name = record["keyframe_id"])
            record["frame_path"] = os.path.relpath(record["frame_path"], AppConfig().DATASET_PATH_TEAM)

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )
        
    async def siglip_v2_image_query_handler(self, image_path: str = Form(...),
                                        k: int = Form(100),
                                        video_filter: Optional[str] = Form(None),
                                        s2t_filter: Optional[str] = Form(None),
                                        return_s2t: bool = Form(True), 
                                        return_object: bool = Form(True),
                                        frame_class_filter: Optional[str] = Form('[]'),
                                        skip_frames: Optional[str] = Form("[]"),
                                        sort_to_news: bool = Form(True)) -> APIResponse:
        
        frame_class_filter = json.loads(frame_class_filter)
        skip_frames_list = json.loads(skip_frames)
        
        try:
            image_bytes = None

            if image_path.startswith("data:image/"):
                # Extract base64 data
                header, data = image_path.split(",", 1)
                image_bytes = base64.b64decode(data)

            elif image_path.startswith(('http://', 'https://')):
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.get(image_path)
                    response.raise_for_status()
                image_bytes = response.content

            else:
                with open(image_path, "rb") as f:
                    image_bytes = f.read()

            # Debug: check raw bytes before opening with Pillow
            logger.info(f"Image bytes length: {len(image_bytes)}")
            logger.info(f"Detected format by imghdr: {imghdr.what(None, h=image_bytes)}")

            # Save a copy of the failing image for inspection
            with open("debug_failed_image.bin", "wb") as f:
                f.write(image_bytes)

            # Try to open
            img = Image.open(BytesIO(image_bytes))
                
            # Convert to RGB and encode
            if img.mode != 'RGB':
                img = img.convert('RGB')
                
            buffered = BytesIO()
            img.save(buffered, format="JPEG")
            image_data = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        except Exception as e:
            logger.exception(f"Image loading failed: {e}")
            raise HTTPException(status_code=400, detail=f"Image loading failed: {e}")
        
        return await self.siglip_v2_image_query(ImageQuery(image_data = image_data,
                                      k = k,
                                      video_filter = video_filter,
                                      s2t_filter = s2t_filter,
                                      return_s2t = return_s2t, 
                                      return_object = return_object,
                                      frame_class_filter = frame_class_filter,
                                      skip_frames = skip_frames_list,
                                      sort_to_news = sort_to_news))        
        
        
    async def siglip_v2_temporal_query_handler(self, text: str = Form(...),
                                        k: int = Form(100),
                                        video_filter: Optional[str] = Form(None),
                                        s2t_filter: Optional[str] = Form(None),
                                        return_s2t: bool = Form(True), 
                                        return_object: bool = Form(True),
                                        frame_class_filter: Optional[str] = Form('[]'),
                                        skip_frames: Optional[str] = Form("[]"),
                                        sort_to_news: bool = Form(True),
                                        main_event_index: int = Form(0),
                                        ) -> APIResponse:
        
        frame_class_filter = json.loads(frame_class_filter)
        skip_frames_list = json.loads(skip_frames)
        
        #url = f"http://{SIGLIPV2Config().SIGLIP_V2_HOST}:{SIGLIPV2Config().SIGLIP_V2_PORT}/siglip_v2/temporal_search"
        url = f"{HubConfig().SIGLIP_V2_HOST_PUBLIC}/siglip_alpha/temporal_search"
        
        payload = {
            "text": str(text),
            "k": int(k),
            "video_filter": None if video_filter is None else str(video_filter),
            "s2t_filter": None if s2t_filter is None else str(s2t_filter),
            "return_s2t": return_s2t,
            "return_object": return_object,
            "frame_class_filter": frame_class_filter,
            "skip_frames": skip_frames_list if skip_frames_list else [],
            "sort_to_news": sort_to_news,
            "main_event_index": main_event_index,
            
        }
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json = payload)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"SIGLIP temporal_search error: {response.text}")
        
        json_data = ujson.loads(response.text)
        
        # Check if data is list of list of dicts
        if json_data["data"] and isinstance(json_data["data"][0], dict):
            # temporal mode: list[dict]
            for idx, record in enumerate(json_data["data"]):
                record["index"] = idx
                record["video_path"] = get_video_path(batch=record["idx_folder"],
                                                    video_name=record["video_name"])
                record["video_path"] = os.path.relpath(record["video_path"], AppConfig().DATASET_PATH_ORIGIN)
                record["frame_path"] = get_frame_path(batch=record["idx_folder"],
                                                    video_name=record["video_name"],
                                                    frame_name=record["keyframe_id"])
                record["frame_path"] = os.path.relpath(record["frame_path"], AppConfig().DATASET_PATH_TEAM)
        elif json_data["data"] and isinstance(json_data["data"][0], list):
            # text mode: list[list[dict]]
            for sent_results in json_data["data"]:
                for idx, record in enumerate(sent_results):
                    record["index"] = idx
                    record["video_path"] = get_video_path(batch=record["idx_folder"],
                                                        video_name=record["video_name"])
                    record["video_path"] = os.path.relpath(record["video_path"], AppConfig().DATASET_PATH_ORIGIN)
                    record["frame_path"] = get_frame_path(batch=record["idx_folder"],
                                                        video_name=record["video_name"],
                                                        frame_name=record["keyframe_id"])
                    record["frame_path"] = os.path.relpath(record["frame_path"], AppConfig().DATASET_PATH_TEAM)

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )
            
    async def siglip_v2_scroll(self, query: ScrollQuery) -> APIResponse:
        
        #url = f"http://{SIGLIPV2Config().SIGLIP_V2_HOST}:{SIGLIPV2Config().SIGLIP_V2_PORT}/siglip_v2/scroll"
        url = f"{HubConfig().SIGLIP_V2_HOST_PUBLIC}/siglip_alpha/scroll"
        
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
            "sort_to_news": query.sort_to_news,
            "utility_feature": query.utility_feature
        }
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json = json)
            
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"SIGLIP scroll error: {response.text}")
        
        json_data = ujson.loads(response.text)
        
        for idx, record in enumerate(json_data["data"]):
            record["index"] = idx
            record["video_path"] = get_video_path(batch = record["idx_folder"],
                                                  video_name = record["video_name"])
            record["video_path"] = os.path.relpath(record["video_path"], AppConfig().DATASET_PATH_ORIGIN)
            
            record["frame_path"] = get_frame_path(batch = record["idx_folder"],
                                                  video_name = record["video_name"],
                                                  frame_name = record["keyframe_id"])
            record["frame_path"] = os.path.relpath(record["frame_path"], AppConfig().DATASET_PATH_TEAM)

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )
        
    async def siglip_v2_scroll_handler(self, k: int = Form(100),
                                    video_filter: Union[str] = Form(...),
                                    s2t_filter: Optional[str] = Form(None),
                                    time_in: Optional[str] = Form(None),
                                    time_out: Optional[str] = Form(None),
                                    return_s2t: bool = Form(True), 
                                    return_object: bool = Form(True),
                                    frame_class_filter: Optional[str] = Form('[]'),
                                    skip_frames: Optional[str] = Form("[]"),
                                    sort_to_news: bool = Form(True),
                                    utility_feature: str = Form("shot")) -> APIResponse:
        
        frame_class_filter = json.loads(frame_class_filter)
        skip_frames_list = json.loads(skip_frames)
        
        # try:
        #     time_in = convert_time_to_frame(video_filter, time_in) if time_in else None
        # except Exception as e:
        #     logger.error(f"Invalid time_out format: {e}")
        #     raise HTTPException(status_code=400, detail=f"Invalid time_out format: {str(e)}")
        # try:
        #     time_out = convert_time_to_frame(video_filter, time_out) if time_out else None
        # except Exception as e:
        #     logger.error(f"Invalid time_out format: {e}")
        #     raise HTTPException(status_code=400, detail=f"Invalid time_out format: {str(e)}")
                    
        return await self.siglip_v2_scroll(ScrollQuery(
                                      k = k,
                                      video_filter = video_filter,
                                      s2t_filter = s2t_filter,
                                      time_in = time_in,
                                      time_out = time_out,
                                      return_s2t = return_s2t, 
                                      return_object = return_object,
                                      frame_class_filter = frame_class_filter,
                                      skip_frames = skip_frames_list,
                                      sort_to_news = sort_to_news,
                                      utility_feature = utility_feature))
        
#==========================================================
#==========================================================   
#=====================SIGLIPv2 BETA CODE========================
#==========================================================
#==========================================================
    async def siglip_v2_beta_text_query_handler(self, text: str = Form(...),
                                        k: int = Form(100),
                                        video_filter: Optional[str] = Form(None),
                                        s2t_filter: Optional[str] = Form(None),
                                        return_s2t: bool = Form(True), 
                                        return_object: bool = Form(True),
                                        frame_class_filter: Optional[str] = Form('[]'),
                                        skip_frames: Optional[str] = Form('[]'),
                                        sort_to_news: bool = Form(True),
                                        ) -> APIResponse:
        
        frame_class_filter = json.loads(frame_class_filter)
        skip_frames_list = json.loads(skip_frames)
        
        #prepare url + json to send to SIGLIP service
        #url = f"http://{SIGLIPV2Config().SIGLIP_V2_HOST}:{SIGLIPV2Config().SIGLIP_V2_PORT}/siglip_v2/text_search"
        url = f"{HubConfig().SIGLIP_V2_B_HOST_PUBLIC}/siglip_beta/text_search"
        
        payload = {
            "text": str(text),
            "k": int(k),
            "video_filter": None if video_filter is None else str(video_filter),
            "s2t_filter": None if s2t_filter is None else str(s2t_filter),
            "return_s2t": return_s2t,
            "return_object": return_object,
            "frame_class_filter": frame_class_filter,
            "skip_frames": skip_frames_list if skip_frames_list else [],
            "sort_to_news": sort_to_news,
            
        }
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)
            
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"SIGLIP text_search error: {response.text}")
        
        json_data = ujson.loads(response.text)

        # Process/Normalize the response data b4 sending to client (easier for frontend to keep track and use)
        for idx, record in enumerate(json_data["data"]):
            record["index"] = idx
            record["video_path"] = get_video_path(batch = record["idx_folder"],
                                                  video_name = record["video_name"])
            record["video_path"] = os.path.relpath(record["video_path"], AppConfig().DATASET_PATH_ORIGIN)
            
            record["frame_path"] = get_frame_path(batch = record["idx_folder"],
                                                  video_name = record["video_name"],
                                                  frame_name = record["keyframe_id"])
            record["frame_path"] = os.path.relpath(record["frame_path"], AppConfig().DATASET_PATH_TEAM)
            # replace the frame_path with low resolution version
            #record["frame_path"] = record["frame_path"].replace(SPLIT_NAME, SPLIT_NAME_LOW_RES)

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )

    async def siglip_v2_beta_image_query(self, query: ImageQuery) -> APIResponse:
        
        #url = f"http://{SIGLIPV2Config().SIGLIP_V2_HOST}:{SIGLIPV2Config().SIGLIP_V2_PORT}/siglip_v2/image_search"
        url = f"{HubConfig().SIGLIP_V2_B_HOST_PUBLIC}/siglip_beta/image_search"
        
        json = {
            "image_data": query.image_data,
            "k": int(query.k),
            "video_filter": None if query.video_filter is None else str(query.video_filter),
            "s2t_filter": None if query.s2t_filter is None else str(query.s2t_filter),
            "return_s2t": query.return_s2t,
            "return_object": query.return_object,
            "frame_class_filter": query.frame_class_filter,
            "skip_frames": query.skip_frames if query.skip_frames else [],
            "sort_to_news": query.sort_to_news,
            
        }
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json = json)
            
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"SIGLIP image_search error: {response.text}")
        
        json_data = ujson.loads(response.text)

        for idx, record in enumerate(json_data["data"]):
            record["index"] = idx
            record["video_path"] = get_video_path(batch = record["idx_folder"],
                                                  video_name = record["video_name"])
            record["video_path"] = os.path.relpath(record["video_path"], AppConfig().DATASET_PATH_ORIGIN)
            
            record["frame_path"] = get_frame_path(batch = record["idx_folder"],
                                                  video_name = record["video_name"],
                                                  frame_name = record["keyframe_id"])
            record["frame_path"] = os.path.relpath(record["frame_path"], AppConfig().DATASET_PATH_TEAM)

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )
        
    async def siglip_v2_beta_image_query_handler(self, image_path: str = Form(...),
                                        k: int = Form(100),
                                        video_filter: Optional[str] = Form(None),
                                        s2t_filter: Optional[str] = Form(None),
                                        return_s2t: bool = Form(True), 
                                        return_object: bool = Form(True),
                                        frame_class_filter: Optional[str] = Form('[]'),
                                        skip_frames: Optional[str] = Form("[]"),
                                        sort_to_news: bool = Form(True)) -> APIResponse:
        
        frame_class_filter = json.loads(frame_class_filter)
        skip_frames_list = json.loads(skip_frames)
        
        try:
            image_bytes = None

            if image_path.startswith("data:image/"):
                # Extract base64 data
                header, data = image_path.split(",", 1)
                image_bytes = base64.b64decode(data)

            elif image_path.startswith(('http://', 'https://')):
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.get(image_path)
                    response.raise_for_status()
                image_bytes = response.content

            else:
                with open(image_path, "rb") as f:
                    image_bytes = f.read()

            # Debug: check raw bytes before opening with Pillow
            logger.info(f"Image bytes length: {len(image_bytes)}")
            logger.info(f"Detected format by imghdr: {imghdr.what(None, h=image_bytes)}")

            # Save a copy of the failing image for inspection
            with open("debug_failed_image.bin", "wb") as f:
                f.write(image_bytes)

            # Try to open
            img = Image.open(BytesIO(image_bytes))
                
            # Convert to RGB and encode
            if img.mode != 'RGB':
                img = img.convert('RGB')
                
            buffered = BytesIO()
            img.save(buffered, format="JPEG")
            image_data = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        except Exception as e:
            logger.exception(f"Image loading failed: {e}")
            raise HTTPException(status_code=400, detail=f"Image loading failed: {e}")
        
        return await self.siglip_v2_beta_image_query(ImageQuery(image_data = image_data,
                                      k = k,
                                      video_filter = video_filter,
                                      s2t_filter = s2t_filter,
                                      return_s2t = return_s2t, 
                                      return_object = return_object,
                                      frame_class_filter = frame_class_filter,
                                      skip_frames = skip_frames_list,
                                      sort_to_news = sort_to_news))        
        
        
    async def siglip_v2_beta_temporal_query_handler(self, text: str = Form(...),
                                        k: int = Form(100),
                                        video_filter: Optional[str] = Form(None),
                                        s2t_filter: Optional[str] = Form(None),
                                        return_s2t: bool = Form(True), 
                                        return_object: bool = Form(True),
                                        frame_class_filter: Optional[str] = Form('[]'),
                                        skip_frames: Optional[str] = Form("[]"),
                                        sort_to_news: bool = Form(True),
                                        main_event_index: int = Form(0)) -> APIResponse:
        
        frame_class_filter = json.loads(frame_class_filter)
        skip_frames_list = json.loads(skip_frames)
        
        #url = f"http://{SIGLIPV2Config().SIGLIP_V2_HOST}:{SIGLIPV2Config().SIGLIP_V2_PORT}/siglip_v2/temporal_search"
        url = f"{HubConfig().SIGLIP_V2_B_HOST_PUBLIC}/siglip_beta/temporal_search"
        
        payload = {
            "text": str(text),
            "k": int(k),
            "video_filter": None if video_filter is None else str(video_filter),
            "s2t_filter": None if s2t_filter is None else str(s2t_filter),
            "return_s2t": return_s2t,
            "return_object": return_object,
            "frame_class_filter": frame_class_filter,
            "skip_frames": skip_frames_list if skip_frames_list else [],
            "sort_to_news": sort_to_news,
            "main_event_index": main_event_index,
            
        }
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json = payload)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"SIGLIP temporal_search error: {response.text}")
        
        json_data = ujson.loads(response.text)
        
        # Check if data is list of list of dicts
        if json_data["data"] and isinstance(json_data["data"][0], dict):
            # temporal mode: list[dict]
            for idx, record in enumerate(json_data["data"]):
                record["index"] = idx
                record["video_path"] = get_video_path(batch=record["idx_folder"],
                                                    video_name=record["video_name"])
                record["video_path"] = os.path.relpath(record["video_path"], AppConfig().DATASET_PATH_ORIGIN)
                record["frame_path"] = get_frame_path(batch=record["idx_folder"],
                                                    video_name=record["video_name"],
                                                    frame_name=record["keyframe_id"])
                record["frame_path"] = os.path.relpath(record["frame_path"], AppConfig().DATASET_PATH_TEAM)
        elif json_data["data"] and isinstance(json_data["data"][0], list):
            # text mode: list[list[dict]]
            for sent_results in json_data["data"]:
                for idx, record in enumerate(sent_results):
                    record["index"] = idx
                    record["video_path"] = get_video_path(batch=record["idx_folder"],
                                                        video_name=record["video_name"])
                    record["video_path"] = os.path.relpath(record["video_path"], AppConfig().DATASET_PATH_ORIGIN)
                    record["frame_path"] = get_frame_path(batch=record["idx_folder"],
                                                        video_name=record["video_name"],
                                                        frame_name=record["keyframe_id"])
                    record["frame_path"] = os.path.relpath(record["frame_path"], AppConfig().DATASET_PATH_TEAM)

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )
            
    async def siglip_v2_beta_scroll(self, query: ScrollQuery) -> APIResponse:
        
        #url = f"http://{SIGLIPV2Config().SIGLIP_V2_HOST}:{SIGLIPV2Config().SIGLIP_V2_PORT}/siglip_v2/scroll"
        url = f"{HubConfig().SIGLIP_V2_B_HOST_PUBLIC}/siglip_beta/scroll"
        
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
            "sort_to_news": query.sort_to_news,
            "utility_feature": query.utility_feature 
        }
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json = json)
            
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"SIGLIP scroll error: {response.text}")
        
        json_data = ujson.loads(response.text)
        
        for idx, record in enumerate(json_data["data"]):
            record["index"] = idx
            record["video_path"] = get_video_path(batch = record["idx_folder"],
                                                  video_name = record["video_name"])
            record["video_path"] = os.path.relpath(record["video_path"], AppConfig().DATASET_PATH_ORIGIN)
            
            record["frame_path"] = get_frame_path(batch = record["idx_folder"],
                                                  video_name = record["video_name"],
                                                  frame_name = record["keyframe_id"])
            record["frame_path"] = os.path.relpath(record["frame_path"], AppConfig().DATASET_PATH_TEAM)

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data=json_data,
        )
        
    async def siglip_v2_beta_scroll_handler(self, k: int = Form(100),
                                    video_filter: Union[str] = Form(...),
                                    s2t_filter: Optional[str] = Form(None),
                                    time_in: Optional[str] = Form(None),
                                    time_out: Optional[str] = Form(None),
                                    return_s2t: bool = Form(True), 
                                    return_object: bool = Form(True),
                                    frame_class_filter: Optional[str] = Form('[]'),
                                    skip_frames: Optional[str] = Form("[]"),
                                    sort_to_news: bool = Form(True),
                                    utility_feature: str = Form("shot")) -> APIResponse:
        
        frame_class_filter = json.loads(frame_class_filter)
        skip_frames_list = json.loads(skip_frames)
                    
        return await self.siglip_v2_beta_scroll(ScrollQuery(
                                      k = k,
                                      video_filter = video_filter,
                                      s2t_filter = s2t_filter,
                                      time_in = time_in,
                                      time_out = time_out,
                                      return_s2t = return_s2t, 
                                      return_object = return_object,
                                      frame_class_filter = frame_class_filter,
                                      skip_frames = skip_frames_list,
                                      sort_to_news = sort_to_news,
                                      utility_feature=utility_feature))