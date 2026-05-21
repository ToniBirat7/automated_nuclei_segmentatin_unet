from fastapi import APIRouter, Request, UploadFile, File, HTTPException
from app.utils.image_processing import preprocess_image
from app.utils.visualization import process_prediction

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_TYPES = {"image/png", "image/jpeg", "image/tiff", "image/bmp"}


@router.post("/segment")
async def segment(request: Request, image: UploadFile = File(...)):
    if image.content_type and image.content_type not in ALLOWED_TYPES:
        raise HTTPException(422, f"Unsupported file type: {image.content_type}")

    image_bytes = await image.read()

    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(413, "File too large. Maximum size is 10MB.")

    if len(image_bytes) == 0:
        raise HTTPException(422, "Empty file.")

    try:
        preprocessed, original_arr = preprocess_image(image_bytes)
    except Exception as e:
        raise HTTPException(422, f"Could not process image: {str(e)}")

    engine = getattr(request.app.state, "engine", None)
    if engine is None:
        raise HTTPException(503, "Model not loaded.")

    raw_output, inference_ms = engine.predict(preprocessed)
    result = process_prediction(raw_output, original_arr)
    result["inference_time_ms"] = round(inference_ms, 2)

    return result


@router.post("/batch-segment")
async def batch_segment(request: Request, images: list[UploadFile] = File(...)):
    if len(images) > 10:
        raise HTTPException(400, "Maximum 10 images per batch.")

    results = []
    for image in images:
        image_bytes = await image.read()
        try:
            preprocessed, original_arr = preprocess_image(image_bytes)
            engine = request.app.state.engine
            raw_output, inference_ms = engine.predict(preprocessed)
            result = process_prediction(raw_output, original_arr)
            result["inference_time_ms"] = round(inference_ms, 2)
            result["filename"] = image.filename
            results.append(result)
        except Exception as e:
            results.append({"filename": image.filename, "error": str(e)})

    return {"results": results}
