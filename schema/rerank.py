from typing import List
from pydantic import BaseModel, ConfigDict


class DetectedObject(BaseModel):
    bbox: List[float]
    object: str
    conf: float


class VideoMetadata(BaseModel):
    key: str
    idx_folder: str
    video_name: str
    keyframe_id: str
    fps: float
    score: float
    s2t: List[str]
    object: List[DetectedObject]
    index: int
    video_path: str
    frame_path: str

    model_config = ConfigDict(arbitrary_types_allowed=True)
