from pydantic import BaseModel
from typing import Optional, List


class TranslateRequest(BaseModel):
    text: str
    target: Optional[str] = "en"
    source: Optional[str] = None


class NeighboringFramesRequest(BaseModel):
    frame_num: str
    video_name: str
    k: int = 1


class GetVectorRequest(BaseModel):
    video_name: str
    frame_name: str


class GetVideoNameRequest(BaseModel):
    batch_id: List[int]
