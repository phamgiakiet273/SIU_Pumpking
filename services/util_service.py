import dotenv

dotenv.load_dotenv()
import uvicorn
import signal
import os
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

from configs.util import UtilConfig
from handlers.util_handler import UtilHandler
from routes.util_router import setup_router
from utils.logger import get_logger
from apis.api import setup_app, TimeoutMiddleware


logger = get_logger()
app = setup_app()

# Handlers
util_handler = UtilHandler()

# Routes
router = setup_router(handler=util_handler)
app.include_router(router)

# app.add_middleware(TimeoutMiddleware, timeout=UtilConfig().REQUEST_TIMEOUT)
if os.getenv("ENABLE_GZIP", "True").lower() == "true":
    app.add_middleware(GZipMiddleware, minimum_size=0)  # compress response > 0 bytes

if __name__ == "__main__":

    uvicorn.run(
        app,
        host=UtilConfig().UTIL_HOST,
        port=UtilConfig().UTIL_PORT,
        workers=UtilConfig().UTIL_MAX_WORKERS,
    )

# Signal handling for graceful shutdown
def handle_sigterm(*args):
    print("Received termination signal. Cleaning up...")
    sys.exit(0)


signal.signal(signal.SIGINT, handle_sigterm)
signal.signal(signal.SIGTERM, handle_sigterm)
