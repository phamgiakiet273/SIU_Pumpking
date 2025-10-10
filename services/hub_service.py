import dotenv
import os

dotenv.load_dotenv()
import uvicorn
import signal
from fastapi.staticfiles import StaticFiles

# dotenv + uvicorn + fastapi + flask + ujson + requests + pillow-avif-plugin + Pillow + httpx + loguru + python-multipart
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

from pathlib import Path
import sys

current_path = Path(__file__).resolve()
for parent in current_path.parents:
    if parent.name == "SIU_Pumpking":
        # print(f"Adding {parent} to sys.path")
        sys.path.append(str(parent))
        break
else:
    raise RuntimeError("Could not find 'SIU_Pumpking' in the path hierarchy.")

from configs.hub_config import HubConfig
from configs.nginx_config import NGINXConfig
from configs.app import AppConfig
from handlers.hub_handler import HubHandler
from routes.hub_router import setup_router
from utils.logger import get_logger
from apis.hub import setup_app, TimeoutMiddleware

logger = get_logger()

app = setup_app()

# Handlers
hub_handler = HubHandler()

# Routes
router = setup_router(handler=hub_handler)
app.include_router(router)

# app.add_middleware(TimeoutMiddleware, timeout=HubConfig().REQUEST_TIMEOUT)
if os.getenv("ENABLE_GZIP", "True").lower() == "true":
    app.add_middleware(GZipMiddleware, minimum_size=0)  # compress response > 0 bytes

# serve local images directly when NGINX_IMAGE_HOST points to localhost
if os.getenv("NGINX_IMAGE_HOST", "").startswith("http://localhost"):
    local_img_path = os.getenv(
        "IMAGE_LOCAL_PATH",
        r"D:\AIC_data",
    )
    # mount at /img so send_img_handler redirects to e.g. http://localhost:9181/img/<path>
    app.mount("/img", StaticFiles(directory=local_img_path), name="local_img")
    
if os.getenv("NGINX_VIDEO_HOST", "").startswith("http://localhost"):
    local_video_path = os.getenv(
        "VIDEO_LOCAL_PATH",
        r"D:\AIC_data",
    )
    # mount at /video so send_video_handler redirects to e.g. http://localhost:5501/video/<path>
    app.mount("/video", StaticFiles(directory=local_video_path), name="local_video")

if __name__ == "__main__":
    uvicorn.run(
        app,
        host=HubConfig().HUB_HOST,
        port=HubConfig().HUB_PORT,
        workers=HubConfig().HUB_MAX_WORKERS,
    )

# Signal handling for graceful shutdown
# Fix UserWarning: resource_tracker: There appear to be 320 leaked semaphore objects to clean up at shutdown
def handle_sigterm(*args):
    print("Received termination signal. Cleaning up...")
    sys.exit(0)


signal.signal(signal.SIGINT, handle_sigterm)
signal.signal(signal.SIGTERM, handle_sigterm)
