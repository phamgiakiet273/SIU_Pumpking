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
    if parent.name == "SIU_Pumpking":
        #print(f"Adding {parent} to sys.path")
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

""" if __name__ == "__main__":

    uvicorn.run(
        app,
        host=HubConfig().HUB_HOST,
        port=HubConfig().HUB_PORT,
        workers=HubConfig().HUB_MAX_WORKERS
    ) """

# Signal handling for graceful shutdown
# Fix UserWarning: resource_tracker: There appear to be 320 leaked semaphore objects to clean up at shutdown
def handle_sigterm(*args):
    print("Received termination signal. Cleaning up...")
    sys.exit(0)


signal.signal(signal.SIGINT, handle_sigterm)
signal.signal(signal.SIGTERM, handle_sigterm)
