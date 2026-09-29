from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database import get_db
from backend.app.ml.model_loader import model_registry
from backend.app.config import settings

router = APIRouter(prefix="/api/health", tags=["System Health"])

@router.get("")
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"

    active_meta = model_registry.get_active_model_meta()
    model_loaded = active_meta is not None

    return {
        "status": "healthy" if db_status == "connected" and model_loaded else "degraded",
        "database": db_status,
        "model_loaded": model_loaded,
        "model_name": active_meta.get("model_name", "None"),
        "model_version": active_meta.get("version", "None"),
        "app_name": settings.APP_NAME,
        "app_version": settings.APP_VERSION,
        "disclaimer": settings.MEDICAL_DISCLAIMER
    }
