import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.ml.preprocessing import validate_image_bytes, extract_dermoscopic_features
from backend.app.ml.inference import run_lesion_inference

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database" in data
    assert "model_loaded" in data
    assert "disclaimer" in data

def test_model_listing_endpoint():
    response = client.get("/api/models")
    assert response.status_code == 200
    models = response.json()
    assert isinstance(models, list)
    assert len(models) >= 1
    assert any(m["model_name"] == "EfficientNetV2-B0" for m in models)

def test_active_model_endpoint():
    response = client.get("/api/models/active")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "version" in data
    assert "metrics" in data

def test_invalid_image_upload_rejection():
    # Empty payload
    response = client.post(
        "/api/predictions/predict",
        files={"image": ("test.txt", b"not an image", "text/plain")}
    )
    # Should reject with 422 or 401 unauthenticated
    assert response.status_code in [401, 422]

def test_oversized_image_handling():
    # Simulate oversized data check
    huge_data = b"0" * (11 * 1024 * 1024)
    with pytest.raises(ValueError, match="exceeds the allowed limit"):
        validate_image_bytes(huge_data, max_size_mb=10)
