import http
import time
from contextlib import asynccontextmanager
from pathlib import Path

import dotenv
from fastapi import FastAPI, Request, status, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

import asyncio
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from fastapi.responses import FileResponse, StreamingResponse

# serving static file (hình ảnh / video)

import os

from pathlib import Path
import sys

current_path = Path(__file__).resolve()
for parent in current_path.parents:
    if parent.name == "SIU_Pumpking":
        #print(f"Adding {parent} to sys.path")
        sys.path.append(str(parent))
        break
else:
    raise RuntimeError("Could not find 'SIU_Pumpking' in the path hierarchy.")

from configs.app import AppConfig
from schema.api import APIResponse
from utils.logger import get_logger, setup_logger

dotenv.load_dotenv()
setup_logger()
logger = get_logger()

BASE_DIR = Path(__file__).resolve().parent.parent  # Adjust if needed


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up")
    yield
    logger.info("Shutting down")


class LimitUploadSizeMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_upload_size: int):
        super().__init__(app)
        self.max_upload_size = max_upload_size  # in bytes

    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("Content-Length")
        if content_length and int(content_length) > self.max_upload_size:
            return JSONResponse(
                content={"detail": "Request body too large"}, status_code=413
            )
        return await call_next(request)


class TimeoutMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, timeout: int = 10):
        super().__init__(app)
        self.timeout = timeout

    async def dispatch(self, request: Request, call_next):
        try:
            return await asyncio.wait_for(call_next(request), timeout=self.timeout)
        except asyncio.TimeoutError:
            return JSONResponse({"detail": "Request timeout"}, status_code=504)


def setup_app() -> FastAPI:
    app = FastAPI(
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "*"
        ],  # Frontend origin, or use ["*"] for all origins (less secure)
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(
        LimitUploadSizeMiddleware, max_upload_size=10 * 1024 * 1024
    )  # 10 MB

    # Set up templates
    templates_dir = BASE_DIR / "templates"
    templates = Jinja2Templates(directory=str(templates_dir))
    app.state.templates = templates

    # Optionally serve static files (e.g., CSS, JS)
    static_dir = BASE_DIR / "static"
    logger.info(f"Looking for static files in: {static_dir}")
    if static_dir.exists():
        logger.info("Mounting static directory")
        app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
    else:
        logger.warning(f"Static directory not found at {static_dir}")

    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response

    # @app.middleware("http")
    # async def disable_caching_middleware(request: Request, call_next):
    #     response: Response = await call_next(request)
    #     # these headers tell browsers (and proxies) not to cache
    #     response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    #     response.headers["Pragma"] = "no-cache"
    #     response.headers["Expires"] = "0"
    #     return response

    @app.exception_handler(status.HTTP_500_INTERNAL_SERVER_ERROR)
    async def internal_exception_handler(request: Request, exc: Exception):
        logger.exception(exc)
        return JSONResponse(
            status_code=http.HTTPStatus.INTERNAL_SERVER_ERROR.value,
            content=APIResponse(
                status=http.HTTPStatus.INTERNAL_SERVER_ERROR.value,
                message=http.HTTPStatus.INTERNAL_SERVER_ERROR.name,
                data=None,
            ).model_dump(),
        )

    @app.exception_handler(ValidationError)
    @app.exception_handler(RequestValidationError)
    async def pydantic_request_validation_error(
        request: Request,
        err: RequestValidationError | ValidationError,
    ):
        logger.exception(err)
        return JSONResponse(
            status_code=http.HTTPStatus.BAD_REQUEST.value,
            content=APIResponse(
                status=http.HTTPStatus.BAD_REQUEST.value,
                message=str(http.HTTPStatus.BAD_REQUEST),
                data=err.errors(),
            ).model_dump(),
        )

    # @app.get("/")
    # async def root():
    #     return APIResponse(
    #         status=http.HTTPStatus.OK.value,
    #         message="Running (Healthy)",
    #     )

    @app.get("/health-check")
    async def health_check():
        return APIResponse(
            status=http.HTTPStatus.OK.value,
            message="Running (Healthy)",
        )

    # Example HTML route
    @app.get("/", response_class=HTMLResponse)
    async def render_html(request: Request):
        base_url = os.getenv("BASE_URL", "https://api.siu.edu.vn/siu_pumpking_1/")
        return request.app.state.templates.TemplateResponse(
            "index.html",
            {"request": request, "name": "FastAPI + Jinja2", "base_url": base_url},
        )

    return app
