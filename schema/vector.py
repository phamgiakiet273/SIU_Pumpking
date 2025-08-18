from typing import Any, Optional, List, Literal, Union
from pydantic import BaseModel, ConfigDict


class QdrantRequest(BaseModel):
    k: int
    feat: Optional[Union[List[float], List[List[float]]]] = None
    video_filter: Optional[Union[str, List[str]]] = None
    s2t_filter: Optional[str] = None
    time_in: Optional[str] = None
    time_out: Optional[str] = None
    return_s2t: bool = True
    return_object: bool = True


class RetrievalRequest(BaseModel):
    image_data: Optional[str] = None  # base64
    text: Optional[str] = None
    k: int
    video_filter: Optional[Union[str, List[str]]] = None
    s2t_filter: Optional[str] = None
    time_in: Optional[str] = None
    time_out: Optional[str] = None
    return_s2t: bool = True
    return_object: bool = True
    return_list: bool = False  # NEW

    # model_config = ConfigDict(arbitrary_types_allowed=True)
