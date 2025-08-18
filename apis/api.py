import http
import time
from contextlib import asynccontextmanager

import dotenv
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError

import asyncio
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

import sys

sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking/")


from configs.app import AppConfig
from schema.api import APIResponse
from utils.logger import get_logger, setup_logger

dotenv.load_dotenv()
setup_logger()
logger = get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up")

    yield
    # Shutdown
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
    app = FastAPI()

    app = FastAPI(
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    app.add_middleware(
        LimitUploadSizeMiddleware, max_upload_size=10 * 1024 * 1024
    )  # 10 MB

    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response

    @app.exception_handler(status.HTTP_500_INTERNAL_SERVER_ERROR)
    async def internal_exception_handler(request: Request, exc: Exception):
        # Handle 500 exception
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
            status_code=http.HTTPStatus.INTERNAL_SERVER_ERROR.value,
            content=APIResponse(
                status=http.HTTPStatus.BAD_REQUEST.value,
                message=str(http.HTTPStatus.BAD_REQUEST),
                data=err.errors(),
            ).model_dump(),
        )

    @app.get("/")
    async def root():
        return APIResponse(
            status=http.HTTPStatus.OK.value,
            message="Running (Healthy)",
        )

    @app.get("/health-check")
    async def health_check():
        return APIResponse(
            status=http.HTTPStatus.OK.value,
            message="Running (Healthy)",
        )

    return app
