from typing import Any, Optional, List, Literal, Union, Dict
from pydantic import BaseModel, ConfigDict, Field

# class TextQuery(BaseModel):
#     text: str
#     k: int = 100
#     video_filter: Optional[str] = None
#     s2t_filter: Optional[str] = None
#     # time_in: Optional[str] = None
#     # time_out: Optional[str] = None
#     return_s2t: bool = True
#     return_object: bool = True
#     frame_class_filter: bool = True
#     skip_frames: List[Dict[str, str]] = Field(default_factory=list)


class ImageQuery(BaseModel):
    image_data: str  # base64
    k: int = 100
    video_filter: Optional[str] = None
    s2t_filter: Optional[str] = None
    # time_in: Optional[str] = None
    # time_out: Optional[str] = None
    return_s2t: bool = True
    return_object: bool = True
    frame_class_filter: bool = True
    skip_frames: List[Dict[str, str]] = Field(default_factory=list)


#     # model_config = ConfigDict(arbitrary_types_allowed=True)

# class TemporalQuery(BaseModel):
#     text: str
#     k: int = 100
#     video_filter: Optional[str] = None
#     s2t_filter: Optional[str] = None
#     # time_in: Optional[str] = None
#     # time_out: Optional[str] = None
#     return_s2t: bool = True
#     return_object: bool = True
#     return_list: bool = False  # NEW
#     frame_class_filter: bool = True
#     skip_frames: List[Dict[str, str]] = Field(default_factory=list)


class ScrollQuery(BaseModel):
    k: int = 100
    video_filter: Optional[str] = None
    # video_filter: str
    s2t_filter: Optional[str] = None
    time_in: Optional[str] = None
    time_out: Optional[str] = None
    return_s2t: bool = True
    return_object: bool = True
    frame_class_filter: bool = True
    skip_frames: List[Dict[str, str]] = Field(default_factory=list)
