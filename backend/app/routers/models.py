from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from backend.app.dependencies import get_current_user, require_roles
from backend.app.models.user import User, UserRole
from backend.app.services.model_service import (
    get_all_models,
    get_active_model,
    set_active_model,
    get_evaluation_metrics
)

router = APIRouter(prefix="/api/models", tags=["Model Registry & Benchmarks"])

@router.get("", response_model=List[Dict[str, Any]])
def list_models():
    return get_all_models()

@router.get("/active", response_model=Dict[str, Any])
def active_model():
    return get_active_model()

@router.get("/metrics", response_model=Dict[str, Any])
def model_metrics():
    return get_evaluation_metrics()

@router.get("/{model_id}", response_model=Dict[str, Any])
def get_model(model_id: str):
    models = get_all_models()
    for m in models:
        if m.get("model_id") == model_id:
            return m
    raise HTTPException(status_code=404, detail="Model not found.")

@router.post("/{model_id}/activate", response_model=Dict[str, Any])
def activate_model(
    model_id: str,
    admin_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    return set_active_model(model_id)
