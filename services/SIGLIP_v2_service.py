import dotenv

dotenv.load_dotenv()
import uvicorn
import signal
import os
from fastapi.middleware.gzip import GZipMiddleware

import sys

sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking")

from configs.SIGLIP_v2_configs import SIGLIPV2Config
from handlers.SIGLIP_v2_handler import SIGLIPV2Handler
from routes.SIGLIP_v2_router import setup_router
from utils.logger import get_logger
from apis.api import setup_app, TimeoutMiddleware

from engine.CLIPFeatureModel.siglip2_model import SIGLIP2
from engine.vector_database.qdrant_database import QDRANT


logger = get_logger()

# Engine
model = SIGLIP2()
qdrant = QDRANT(SIGLIPV2Config().SIGLIP_V2_DATABASE_NAME)

app = setup_app()

# Handlers
vector_retrieval_handler = SIGLIPV2Handler(qdrant_database=qdrant, model=model)

# Routes
router = setup_router(handler=vector_retrieval_handler)
app.include_router(router)

# app.add_middleware(TimeoutMiddleware, timeout=SIGLIPVectorRetrievalConfig().REQUEST_TIMEOUT)
if os.getenv("ENABLE_GZIP", "True").lower() == "true":
    app.add_middleware(GZipMiddleware, minimum_size=0)  # compress response > 0 bytes

if __name__ == "__main__":
    uvicorn.run(
        app,
        host=SIGLIPV2Config().SIGLIP_V2_HOST,
        port=SIGLIPV2Config().SIGLIP_V2_PORT,
        workers=SIGLIPV2Config().SIGLIP_V2_MAX_WORKERS,
        timeout_keep_alive=SIGLIPV2Config().TIMEOUT_KEEP_ALIVE,
    )

# Signal handling for graceful shutdown
def handle_sigterm(*args):
    print("Received termination signal. Cleaning up...")
    sys.exit(0)


signal.signal(signal.SIGINT, handle_sigterm)
signal.signal(signal.SIGTERM, handle_sigterm)
