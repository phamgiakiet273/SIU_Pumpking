import dotenv

dotenv.load_dotenv()
import uvicorn
import signal
import os
from fastapi.middleware.gzip import GZipMiddleware

import sys

sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking")

from configs.submission import SubmissionConfig
from handlers.submission_handler import SubmissionHandler
from routes.submission_router import setup_router
from utils.logger import get_logger
from apis.api import setup_app, TimeoutMiddleware


logger = get_logger()
app = setup_app()

# Handlers
submission_handler = SubmissionHandler()

# Routes
router = setup_router(handler=submission_handler)
app.include_router(router)

# app.add_middleware(TimeoutMiddleware, timeout=UtilConfig().REQUEST_TIMEOUT)
if os.getenv("ENABLE_GZIP", "True").lower() == "true":
    app.add_middleware(GZipMiddleware, minimum_size=0)  # compress response > 0 bytes

if __name__ == "__main__":

    uvicorn.run(
        app,
        host=SubmissionConfig().SUBMISSION_HOST,
        port=SubmissionConfig().SUBMISSION_PORT,
        workers=SubmissionConfig().SUBMISSION_MAX_WORKERS,
    )

# Signal handling for graceful shutdown
def handle_sigterm(*args):
    print("Received termination signal. Cleaning up...")
    sys.exit(0)


signal.signal(signal.SIGINT, handle_sigterm)
signal.signal(signal.SIGTERM, handle_sigterm)
