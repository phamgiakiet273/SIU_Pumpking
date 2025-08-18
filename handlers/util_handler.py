from fastapi import HTTPException
from http import HTTPStatus
from configs.util import UtilConfig
from schema.api import APIResponse
from schema.util import (
    TranslateRequest,
    NeighboringFramesRequest,
    GetVectorRequest,
    GetVideoNameRequest,
)
from utils.logger import get_logger
from utils.get_k_frames import get_neighboring_frames
from utils.get_name_videos import get_video_names
import requests
import os

from qdrant_client import QdrantClient, models
from typing import Optional
from fastapi import Form

client = QdrantClient(url="http://localhost:6333")
logger = get_logger()


class UtilHandler:
    def __init__(self):
        config = UtilConfig()
        self.api_key = config.GG_TRANSLATE_API_KEY
        self.endpoint = config.GG_TRANSLATE_ENDPOINT

    async def ping_handler(self) -> APIResponse:
        logger.info("ping_handler invoked")
        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data="ping",
        )

    async def translate_handler(self, request: TranslateRequest) -> APIResponse:
        logger.info(f"translate_handler invoked: {request}")
        if not self.endpoint:
            logger.error("Google Translate endpoint is not configured.")
            raise HTTPException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                detail="Google Translate endpoint is not configured.",
            )

        # Tách câu dựa trên dấu chấm, giữ lại dấu chấm và khoảng trắng
        import re

        sentences = re.findall(r"[^.]+(?:\.)?", request.text)
        translated_sentences = []

        for sentence in sentences:
            sentence_strip = sentence.strip()
            if not sentence_strip:
                continue
            params = {
                "q": sentence_strip,
                "source": request.source,
                "target": request.target,
                "format": "text",
                "key": self.api_key,
            }
            try:
                response = requests.post(self.endpoint, data=params)
                if response.status_code != 200:
                    logger.error(f"Google Translate API error: {response.text}")
                    raise HTTPException(
                        status_code=response.status_code, detail=response.text
                    )
                result = response.json()
                translated_text = result["data"]["translations"][0]["translatedText"]
                # Giữ lại dấu chấm nếu câu gốc có
                if sentence_strip.endswith(".") and not translated_text.endswith("."):
                    translated_text += "."
                translated_sentences.append(translated_text.strip())
            except Exception as e:
                logger.error(f"Exception in translate_handler: {e}")
                raise HTTPException(
                    status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail=str(e)
                )

        final_text = " ".join(translated_sentences)
        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Translation successful",
            data=final_text,
        )

    async def get_neighboring_frames_handler(
        self, request: NeighboringFramesRequest
    ) -> APIResponse:
        frame_num = request.frame_num
        video_name = request.video_name
        k = request.k
        logger.info(
            f"get_neighboring_frames_handler invoked: frame_num={frame_num}, video_name={video_name}, k={k}"
        )
        try:
            prev_frames, next_frames = get_neighboring_frames(
                frame_num=frame_num, video_name=video_name, k=k
            )

            base_path = UtilConfig().BASE_PATH
            if not base_path.endswith("/"):
                base_path += "/"
            # Replace base_path to empty for each path
            prev_frames = [p.replace(base_path, "") for p in prev_frames]
            next_frames = [p.replace(base_path, "") for p in next_frames]

            return APIResponse(
                status=HTTPStatus.OK.value,
                message="Success",
                data={"prev_frames": prev_frames, "next_frames": next_frames},
            )
        except Exception as e:
            logger.error(f"Error in get_neighboring_frames_handler: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_vector_handler(self, request: GetVectorRequest) -> APIResponse:
        """Lấy vector của frame.
        Nếu đường dẫn frame hoặc collection name bị thay đổi thì sẽ bị ảnh hưởng.
        Điều kiện bắt buộc ở trên là frame truyền vô phải chắc chắn có trong database.
        """
        video_name = request.video_name
        frame_name = request.frame_name
        logger.info(
            f"get_vector_handler invoked: video_name={video_name}, frame_name={frame_name}"
        )

        FILTER_RESULTS = models.Filter(
            must=[
                models.FieldCondition(
                    key="video_name",
                    match=models.MatchValue(value=video_name + ".mp4"),
                ),
                models.FieldCondition(
                    key="frame_name",
                    match=models.MatchValue(value=int(frame_name)),
                ),
            ]
        )
        SCROLL_RESULT = client.scroll(
            collection_name="PUMPKING_SIGLIP_V2",
            scroll_filter=FILTER_RESULTS,
            with_payload=True,
            limit=1,
        )

        for item in SCROLL_RESULT[0]:
            for idx, field in enumerate(item):
                if idx == 1:
                    idx_folder = str(field[1]["idx_folder"])
                    related_start_frame = str(field[1]["related_start_frame"])
                    related_end_frame = str(field[1]["related_end_frame"])

        try:
            FILTER_RESULTS = models.Filter(
                must=[
                    models.FieldCondition(
                        key="video_name",
                        match=models.MatchValue(value=video_name + ".mp4"),
                    ),
                    models.FieldCondition(
                        key="frame_name",
                        range=models.Range(
                            gte=int(related_start_frame), lte=int(related_end_frame)
                        ),
                    ),
                ]
            )
            SCROLL_RESULT = client.scroll(
                collection_name="PUMPKING_SIGLIP_V2",
                scroll_filter=FILTER_RESULTS,
                with_payload=True,
                limit=10000,
            )

            frame_paths = []
            for item in SCROLL_RESULT[0]:
                for idx, field in enumerate(item):
                    if idx == 1:
                        idx_folder = str(field[1]["idx_folder"])
                        keyframe_id = str(field[1]["frame_name"]).zfill(5)
                        related_start_frame = str(field[1]["related_start_frame"])
                        related_end_frame = str(field[1]["related_end_frame"])
                        frame_path = os.path.join(
                            "/dataset/AIC2024/pumkin_dataset/Vinh",
                            idx_folder,
                            "frames/autoshot",
                            f"Keyframes_{video_name[:3]}",
                            "keyframes",
                            video_name,
                            keyframe_id,
                        )
                        frame_paths.append(frame_path)

            return APIResponse(
                status=HTTPStatus.OK.value, message="Success", data=frame_paths
            )

        except Exception as e:
            logger.error(
                f"Error in get_vector_handler. maybe frame isn't in database? {e}"
            )
            raise HTTPException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                detail="Error in get_vector_handler. maybe frame isn't in database?",
            )

    async def get_video_names_handler(
        self, request: GetVideoNameRequest
    ) -> APIResponse:
        """
        Trả về danh sách tên video (không có đuôi .mp4) theo batch index truyền vào.
        """
        try:
            batch_id = request.batch_id
            logger.info(f"get_video_names_handler invoked: batch_id={batch_id}")

            video_names = get_video_names(batch_id)
            return APIResponse(
                status=HTTPStatus.OK.value, message="Success", data=video_names
            )
        except Exception as e:
            logger.error(f"Error in get_video_names_handler: {e}")
            raise HTTPException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                detail="Error in get_video_names_handler",
            )
