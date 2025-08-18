import base64
import logging
import os
from http import HTTPStatus
from io import BytesIO
from typing import List, Optional, Union
import time

import numpy as np
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from engine.vector_database.qdrant_database import QDRANT
from engine.CLIPFeatureModel.metaclip2_model import METACLIP
from schema.api import APIResponse
from schema.vector_v2 import QdrantRequest, RetrievalRequest
from utils.logger import get_logger
from utils.vector_database_util import preprocessing_text, preprocessing_image
from utils.metadata_util import bytes_to_pil_image
from configs.app import AppConfig
from configs.METACLIP_v2_configs import METACLIPV2Config

logger = get_logger()

# logger.info -> print
# logger.warning -> print nhưng màu vàng
# logger.error -> dừng chương trình -> báo lỗi

os.environ["TRANSFORMERS_CACHE"] = AppConfig().TRANSFORMERS_CACHE
os.environ["CUDA_DEVICE_ORDER"] = AppConfig().CUDA_DEVICE_ORDER
os.environ["CUDA_VISIBLE_DEVICES"] = METACLIPV2Config().METACLIP_V2_CUDA_VISIBLE_DEVICES


class METACLIPV2Handler:
    def __init__(self, qdrant_database: QDRANT, model: METACLIP) -> None:
        logger.info("Initialized GeneralHandler with QDRANT and METACLIP2 model")
        self.qdrant = qdrant_database
        self.model = model

    async def ping_handler(self) -> APIResponse:
        logger.info("ping_handler invoked")
        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data="ping",
        )

    def setup_database_handler(self) -> APIResponse:
        logger.info(
            "Setting up database of METACLIP, expecting up to 60 minutes to finish"
        )
        st = time.time()
        self.qdrant.addDatabase(
            collection_name=METACLIPV2Config().METACLIP_V2_DATABASE_NAME,
            feature_size=int(METACLIPV2Config().METACLIP_V2_FEATURES_SIZE),
            KEYFRAME_FOLDER_PATH=AppConfig().KEYFRAME_FOLDER_PATH,
            FEATURES_PATH=METACLIPV2Config().METACLIP_V2_FEATURES_PATH,
            SPLIT_NAME=AppConfig().SPLIT_NAME,
            S2T_PATH=AppConfig().S2T_PATH,
            OBJECT_PATH=AppConfig().OBJECT_PATH,
            FPS_PATH=AppConfig().FPS_PATH,
            SHOT_PATH=AppConfig().SHOT_PATH,
        )
        dummy_query = (
            np.load(METACLIPV2Config().METACLIP_V2_DUMMY_VECTOR_PATH)
            .reshape(1, -1)
            .astype("float32")[0]
        )
        logger.info("Warming up with dummy query")
        self.qdrant.search(dummy_query, 3, "", "", "")
        logger.info("Dummy query finished, ready to use!")

        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Success",
            data={f"Time taken: {time.time()-st}"},
        )

    async def scroll_handler(self, req: QdrantRequest) -> APIResponse:
        logger.info(
            f"scroll called with k={req.k}, video_filter={req.video_filter}, s2t_filter = {req.s2t_filter}, time_in={req.time_in}, time_out={req.time_out}"
        )
        result = self.qdrant.scroll_video(
            k=req.k,
            s2t_filter=req.s2t_filter,
            video_filter=req.video_filter,
            time_in=req.time_in,
            time_out=req.time_out,
            return_s2t=req.return_s2t,
            return_object=req.return_object,
            frame_class_filter=req.frame_class_filter,
            skip_frames=req.skip_frames,
        )
        logger.info("Scroll video retrieval completed")
        return APIResponse(status=HTTPStatus.OK.value, message="Success", data=result)

    async def text_search_handler(self, req: RetrievalRequest) -> APIResponse:

        logger.info(f"text_search called with text={req.text}, k={req.k}")
        if not req.text:
            logger.error("Missing text for search")
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST.value,
                detail="Missing text for search",
            )
        feat = preprocessing_text(self.model, req.text)
        logger.info("Text feature extracted for search")
        result = self.qdrant.search(
            query=feat,
            k=req.k,
            video_filter=req.video_filter,
            s2t_filter=req.s2t_filter,
            return_s2t=req.return_s2t,
            return_object=req.return_object,
            frame_class_filter=req.frame_class_filter,
            skip_frames=req.skip_frames,
        )
        logger.info(f"Text search completed with query {str(req.text)}")
        return APIResponse(status=HTTPStatus.OK.value, message="Success", data=result)

    async def image_search_handler(self, req: RetrievalRequest) -> APIResponse:
        logger.info(f"image_search called with image_data, k={req.k}")
        if not req.image_data:
            logger.error("Missing image_data for search")
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST.value,
                detail="Missing image_data for search",
            )

        image_data = base64.b64decode(req.image_data)
        image_data = bytes_to_pil_image(image_data)
        feat = preprocessing_image(self.model, image_data)
        logger.info("Image feature extracted for search")
        result = self.qdrant.search(
            query=feat,
            k=req.k,
            video_filter=req.video_filter,
            s2t_filter=req.s2t_filter,
            return_s2t=req.return_s2t,
            return_object=req.return_object,
            frame_class_filter=req.frame_class_filter,
            skip_frames=req.skip_frames,
        )
        logger.info("Image search completed")
        return APIResponse(status=HTTPStatus.OK.value, message="Success", data=result)

    async def temporal_search_handler(self, req: RetrievalRequest) -> APIResponse:
        logger.info(f"temporal_search called with text={req.text}, k={req.k}")
        if not req.text:
            logger.error("Missing text for temporal search")
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST.value,
                detail="Missing text for temporal search",
            )
        text = req.text.rstrip(".")
        segments = [seg.strip() for seg in text.split(".") if seg.strip()]
        logger.info(f"Temporal segments extracted: {segments}")
        feats = [preprocessing_text(self.model, seg) for seg in segments]
        logger.info("Features extracted for all temporal segments")
        # logger.info(f"FEATS len: {len(feats)} + Type: {type(feats)}")
        # logger.info(f"FEATS[0] Type: {type(feats[0])}")

        result = self.qdrant.search_temporal(
            queryList=feats,
            k=req.k,
            video_filter=req.video_filter,
            s2t_filter=req.s2t_filter,
            return_s2t=req.return_s2t,
            return_object=req.return_object,
            frame_class_filter=req.frame_class_filter,
            skip_frames=req.skip_frames,
        )
        logger.info(f"Temporal search completed with query {str(segments)}")
        return APIResponse(status=HTTPStatus.OK.value, message="Success", data=result)
