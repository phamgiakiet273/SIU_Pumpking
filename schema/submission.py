from pydantic import BaseModel
from typing import Optional


class SubmitRequest(BaseModel):
    session_id: str
    eval_id: str
    mediaItemName: str
    start: int
    end: int
