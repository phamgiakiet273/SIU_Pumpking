from typing import Any, Optional, List, Literal, Union, Dict
from pydantic import BaseModel, ConfigDict, Field


class QdrantRequest(BaseModel):
    k: int
    feat: Optional[Union[List[float], List[List[float]]]] = None
    video_filter: Optional[Union[str, List[str]]] = None
    s2t_filter: Optional[str] = None
    time_in: Optional[str] = None
    time_out: Optional[str] = None
    return_s2t: bool = True
    return_object: bool = True
    frame_class_filter: bool = True
    skip_frames: List[Dict[str, str]] = Field(default_factory=list)


class RetrievalRequest(BaseModel):
    image_data: Optional[str] = None  # base64
    text: Optional[str] = None
    k: int
    video_filter: Optional[Union[str, List[str]]] = None
    s2t_filter: Optional[str] = None
    return_s2t: bool = True
    return_object: bool = True
    frame_class_filter: bool = True
    skip_frames: List[Dict[str, str]] = Field(default_factory=list)
    # model_config = ConfigDict(arbitrary_types_allowed=True)
