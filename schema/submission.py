from pydantic import BaseModel
from typing import Optional
    
class SubmitKISRequest(BaseModel):
    session_id: str
    eval_id: str
    mediaItemName: str
    start: int
    end: int
    
class SubmitQARequest(BaseModel):
    session_id: str
    eval_id: str
    answer: str
    video_id: str
    time: str
    
class SubmitTRAKERequest(BaseModel):
    session_id: str
    eval_id: str
    video_id: str
    frame_ids: str
