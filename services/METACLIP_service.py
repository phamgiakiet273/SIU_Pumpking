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
    if parent.name == "SIU_Pumpking":
        #print(f"Adding {parent} to sys.path")
        sys.path.append(str(parent))
        break
else:
    raise RuntimeError("Could not find 'SIU_Pumpking' in the path hierarchy.")

from configs.METACLIP_configs import METACLIPConfig
from handlers.METACLIP_handler import METACLIPHandler
from routes.METACLIP_router import setup_router
from utils.logger import get_logger
from apis.api import setup_app, TimeoutMiddleware

from engine.CLIPFeatureModel.metaclip_model import METACLIP
from engine.vector_database.qdrant_database import QDRANT


logger = get_logger()

# Engine
model = METACLIP()
qdrant = QDRANT(METACLIPConfig().METACLIP_DATABASE_NAME)

app = setup_app()

# Handlers
vector_retrieval_handler = METACLIPHandler(qdrant_database=qdrant, model=model)

# Routes
router = setup_router(handler=vector_retrieval_handler)
app.include_router(router)

# app.add_middleware(TimeoutMiddleware, timeout=SIGLIPVectorRetrievalConfig().REQUEST_TIMEOUT)
if os.getenv("ENABLE_GZIP", "True").lower() == "true":
    app.add_middleware(GZipMiddleware, minimum_size=0)  # compress response > 0 bytes

if __name__ == "__main__":
    uvicorn.run(
        app,
        host=METACLIPConfig().METACLIP_HOST,
        port=METACLIPConfig().METACLIP_PORT,
        workers=METACLIPConfig().METACLIP_MAX_WORKERS,
        timeout_keep_alive=METACLIPConfig().TIMEOUT_KEEP_ALIVE,
    )

# Signal handling for graceful shutdown
def handle_sigterm(*args):
    print("Received termination signal. Cleaning up...")
    sys.exit(0)


signal.signal(signal.SIGINT, handle_sigterm)
signal.signal(signal.SIGTERM, handle_sigterm)
