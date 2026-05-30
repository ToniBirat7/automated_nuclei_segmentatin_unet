import base64
import io
import pytest


def test_health(client):
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert "model_loaded" in body
    assert isinstance(body["model_loaded"], bool)


def test_samples(client):
    resp = client.get("/api/v1/samples")
    assert resp.status_code == 200
    body = resp.json()
    assert "samples" in body
    assert isinstance(body["samples"], list)
    for s in body["samples"]:
        assert "name" in s
        assert "url" in s
        assert "description" in s


def test_segment_invalid_content_type(client):
    txt = io.BytesIO(b"not an image")
    resp = client.post(
        "/api/v1/segment",
        files={"image": ("test.txt", txt, "text/plain")},
    )
    assert resp.status_code == 422


def test_segment_no_model_returns_503_or_result(client, test_image_bytes, model_loaded):
    resp = client.post(
        "/api/v1/segment",
        files={"image": ("test.png", io.BytesIO(test_image_bytes), "image/png")},
    )
    if model_loaded:
        assert resp.status_code == 200
        body = resp.json()
        for key in ("segmentation_mask", "overlay_image", "confidence_map"):
            assert key in body
            raw = base64.b64decode(body[key])
            assert raw[:4] == b"\x89PNG", f"{key} is not a valid PNG"
        assert isinstance(body["nuclei_count"], int)
        assert isinstance(body["inference_time_ms"], float)
    else:
        assert resp.status_code == 503


@pytest.mark.skipif(True, reason="requires ONNX model — run locally after convert_model.py")
def test_segment_full_pipeline(client, test_image_bytes):
    resp = client.post(
        "/api/v1/segment",
        files={"image": ("test.png", io.BytesIO(test_image_bytes), "image/png")},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["nuclei_count"] >= 0
    assert body["inference_time_ms"] > 0
