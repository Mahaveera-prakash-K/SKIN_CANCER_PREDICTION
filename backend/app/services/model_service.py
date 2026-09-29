from typing import Dict, Any, List
from fastapi import HTTPException, status
from backend.app.ml.model_loader import model_registry

def get_all_models() -> List[Dict[str, Any]]:
    if not model_registry.comparison_data:
        model_registry.load_metadata()
    return model_registry.comparison_data.get("models", [])

def get_active_model() -> Dict[str, Any]:
    return model_registry.get_active_model_meta()

def set_active_model(model_id: str) -> Dict[str, Any]:
    success = model_registry.set_active_model(model_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model with ID '{model_id}' was not found in registered models."
        )
    return model_registry.get_active_model_meta()

def get_evaluation_metrics() -> Dict[str, Any]:
    if not model_registry.classification_report:
        model_registry.load_metadata()
    return {
        "classification_report": model_registry.classification_report,
        "dataset": model_registry.comparison_data.get("dataset", {}) if model_registry.comparison_data else {},
        "active_model": model_registry.get_active_model_meta()
    }
