import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def model_loaded(client):
    resp = client.get("/api/v1/health")
    return resp.json().get("model_loaded", False)


@pytest.fixture
def test_image_bytes():
    import os
    path = os.path.join(os.path.dirname(__file__), "..", "samples", "Test.png")
    if not os.path.exists(path):
        pytest.skip("Test.png not found in backend/samples/")
    with open(path, "rb") as f:
        return f.read()
