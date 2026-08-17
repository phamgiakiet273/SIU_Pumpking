import dotenv
import os
dotenv.load_dotenv()
import uvicorn
import signal
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware 

from pathlib import Path
import sys

current_path = Path(__file__).resolve()
for parent in current_path.parents:
    # Project root is detected by content (it holds configs/ and utils/)
    # rather than by folder name, so the tree can be checked out under any
    # directory name - e.g. SIU_Pumpking_local on a client machine.
    if (parent / "configs").is_dir() and (parent / "utils").is_dir():
        sys.path.append(str(parent))
        break
else:
    raise RuntimeError("Could not find the SIU_Pumpking project root (a parent directory containing configs/ and utils/).")

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
router = setup_router(handler = hub_handler)
app.include_router(router)

#app.add_middleware(TimeoutMiddleware, timeout=HubConfig().REQUEST_TIMEOUT)
if os.getenv("ENABLE_GZIP", "True").lower() == "true":
    app.add_middleware(GZipMiddleware, minimum_size=0)  # compress response > 0 bytes

# Serve local images/videos directly when NGINX_IMAGE_HOST points at this box
# AND the dataset is actually present. On a client machine that only runs the
# hub (dataset lives on the remote server) the directory does not exist, so we
# skip the mount instead of crashing at startup - send_img_handler still
# redirects the browser to the remote NGINX_IMAGE_HOST.
if os.getenv("NGINX_IMAGE_HOST", "").startswith("http://localhost"):
    local_img_path = os.getenv(
        "IMAGE_LOCAL_PATH",
        "/mnt/e/random42/data/aic_2025",
    )
    # mount at /img so send_img_handler redirects to e.g. http://localhost:9021/img/<path>
    if os.path.isdir(local_img_path):
        print(f"StaticFiles mounted at: {local_img_path}")
        app.mount("/img", StaticFiles(directory=local_img_path), name="local_img")
    else:
        print(f"Skipping /img mount, directory not found: {local_img_path}")

if os.getenv("NGINX_VIDEO_HOST", "").startswith("http://localhost"):
    local_video_path = os.getenv(
        "VIDEO_LOCAL_PATH",
        "/mnt/e/random42/data/aic_2025",
    )
    # mount at /video so send_video_handler redirects to e.g. http://localhost:9021/video/<path>
    if os.path.isdir(local_video_path):
        app.mount("/video", StaticFiles(directory=local_video_path), name="local_video")
    else:
        print(f"Skipping /video mount, directory not found: {local_video_path}")

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