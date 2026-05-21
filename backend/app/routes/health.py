import os
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter()

SAMPLE_METADATA = [
    {"name": "sample_01.png", "description": "Dense nuclei — high overlap"},
    {"name": "sample_02.png", "description": "Sparse nuclei — clear boundaries"},
    {"name": "sample_03.png", "description": "Mixed density — varied sizes"},
    {"name": "sample_04.png", "description": "High contrast fluorescence"},
    {"name": "sample_05.png", "description": "Low contrast brightfield"},
    {"name": "sample_06.png", "description": "Phase contrast imaging"},
]


@router.get("/health")
async def health(request: Request):
    engine = getattr(request.app.state, "engine", None)
    return {"status": "ok", "model_loaded": engine is not None and engine.is_loaded}


@router.get("/samples")
async def samples(request: Request):
    samples_dir = os.path.join(os.path.dirname(__file__), "..", "..", "samples")
    result = []
    for meta in SAMPLE_METADATA:
        path = os.path.join(samples_dir, meta["name"])
        if os.path.exists(path):
            result.append({
                "name": meta["name"],
                "url": f"/samples/{meta['name']}",
                "description": meta["description"],
            })
    return {"samples": result}
