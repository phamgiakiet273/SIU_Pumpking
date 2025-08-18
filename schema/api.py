from typing import Any, Optional

from pydantic import BaseModel


class APIResponse(BaseModel):
    status: int
    message: str
    data: Optional[Any] = None
