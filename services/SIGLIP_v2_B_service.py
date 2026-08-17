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

from configs.SIGLIP_v2_B_configs import SIGLIPV2BetaConfig
from handlers.SIGLIP_v2_B_handler import SIGLIPV2BetaHandler
from routes.SIGLIP_v2_B_router import setup_router
from utils.logger import get_logger
from apis.api import setup_app, TimeoutMiddleware

from engine.CLIPFeatureModel.siglip2_model import SIGLIP2
from engine.vector_database.qdrant_database import QDRANT


logger = get_logger()

# Engine
model = SIGLIP2()
qdrant = QDRANT(SIGLIPV2BetaConfig().SIGLIP_V2_QDRANT_URL,
                SIGLIPV2BetaConfig().SIGLIP_V2_QDRANT_PORT,                
                SIGLIPV2BetaConfig().SIGLIP_V2_QDRANT_GRPC_PORT,
                SIGLIPV2BetaConfig().SIGLIP_V2_DATABASE_NAME)

app = setup_app()

# Handlers
vector_retrieval_handler = SIGLIPV2BetaHandler(qdrant_database = qdrant,
                                                        model = model)

# Routes
router = setup_router(handler = vector_retrieval_handler)
app.include_router(router)

#app.add_middleware(TimeoutMiddleware, timeout=SIGLIPVectorRetrievalConfig().REQUEST_TIMEOUT)
if os.getenv("ENABLE_GZIP", "True").lower() == "true":
    app.add_middleware(GZipMiddleware, minimum_size=0)  # compress response > 0 bytes

if __name__ == "__main__":
    uvicorn.run(
        app,
        host=SIGLIPV2BetaConfig().SIGLIP_V2_HOST,
        port=SIGLIPV2BetaConfig().SIGLIP_V2_PORT,
        workers=SIGLIPV2BetaConfig().SIGLIP_V2_MAX_WORKERS, 
        timeout_keep_alive=SIGLIPV2BetaConfig().TIMEOUT_KEEP_ALIVE
    )
    
# Signal handling for graceful shutdown   
def handle_sigterm(*args):
    print("Received termination signal. Cleaning up...")
    sys.exit(0)
signal.signal(signal.SIGINT, handle_sigterm)
signal.signal(signal.SIGTERM, handle_sigterm)