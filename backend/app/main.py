import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.model import OnnxInferenceEngine
from app.routes import segment, health


MODEL_PATH = os.getenv(
    "MODEL_PATH",
    os.path.join(os.path.dirname(__file__), "..", "models", "unet_nuclei.onnx")
)

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        app.state.engine = OnnxInferenceEngine(os.path.abspath(MODEL_PATH))
        print(f"Model loaded from {MODEL_PATH}")
    except FileNotFoundError as e:
        print(f"WARNING: {e}. Run scripts/convert_model.py first.")
        app.state.engine = None
    yield


app = FastAPI(
    title="Nuclei Segmentation API",
    description="U-Net automated nuclei segmentation — KEC 2025 / InJET",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1")
app.include_router(segment.router, prefix="/api/v1")

samples_dir = os.path.join(os.path.dirname(__file__), "..", "samples")
if os.path.exists(samples_dir):
    app.mount("/samples", StaticFiles(directory=samples_dir), name="samples")


@app.get("/")
async def root():
    return {"message": "Nuclei Segmentation API", "docs": "/docs"}
