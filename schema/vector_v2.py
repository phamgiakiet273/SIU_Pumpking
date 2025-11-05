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
    frame_class_filter: Optional[List[int]] = None
    skip_frames: List[Dict[str, str]] = Field(default_factory=list)
    sort_to_news: bool = True
    is_unique: bool = True

class RetrievalRequest(BaseModel):
    image_data: Optional[str] = None #base64
    text: Optional[str] = None
    k: int
    video_filter: Optional[Union[str, List[str]]] = None
    s2t_filter: Optional[str] = None
    return_s2t: bool = True
    return_object: bool = True
    frame_class_filter: Optional[List[int]] = None
    skip_frames: List[Dict[str, str]] = Field(default_factory=list)
    sort_to_news: bool = True
    main_event_index: Optional[int] = 0
    is_unique: bool = True
    # model_config = ConfigDict(arbitrary_types_allowed=True)
