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

from configs.result_manager_config import ResultManagerConfig
from configs.nginx_config import NGINXConfig
from configs.app import AppConfig
from handlers.result_manager_handler import ResultManagerHandler
from routes.result_manager_router import setup_router
from utils.logger import get_logger
from apis.result_manager import setup_app, TimeoutMiddleware

logger = get_logger()

app = setup_app()

# Handlers
result_manager_handler = ResultManagerHandler()

# Routes
router = setup_router(handler = result_manager_handler)
app.include_router(router)

#app.add_middleware(TimeoutMiddleware, timeout=HubConfig().REQUEST_TIMEOUT)
if os.getenv("ENABLE_GZIP", "True").lower() == "true":
    app.add_middleware(GZipMiddleware, minimum_size=0)  # compress response > 0 bytes

if __name__ == "__main__":
    uvicorn.run(
        app,
        host=ResultManagerConfig().RESULT_MANAGER_HOST,
        port=ResultManagerConfig().RESULT_MANAGER_PORT,
        workers=1
    )

# Signal handling for graceful shutdown   
# Fix UserWarning: resource_tracker: There appear to be 320 leaked semaphore objects to clean up at shutdown 
def handle_sigterm(*args):
    print("Received termination signal. Cleaning up...")
    sys.exit(0)
signal.signal(signal.SIGINT, handle_sigterm)
signal.signal(signal.SIGTERM, handle_sigterm)