from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.models.prediction import Prediction
from backend.app.schemas.prediction import PredictionResponse, PredictionSummary, PredictionDetail
from backend.app.services.prediction_service import (
    process_and_save_prediction,
    get_user_predictions,
    delete_prediction
)
from backend.app.ml.preprocessing import CLASS_METADATA
from backend.app.config import settings

router = APIRouter(prefix="/api/predictions", tags=["Predictions & Explainability"])

@router.post("/predict", response_model=PredictionResponse)
async def predict_skin_lesion(
    image: UploadFile = File(...),
    notes: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Uploaded file must be a valid image (JPEG, PNG, WEBP)."
        )

    image_bytes = await image.read()
    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Uploaded image file is empty."
        )

    result = process_and_save_prediction(
        db=db,
        user=current_user,
        image_bytes=image_bytes,
        filename=image.filename or "upload.png",
        notes=notes
    )
    return result

@router.get("", response_model=List[PredictionSummary])
def list_predictions(
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = get_user_predictions(db, current_user, limit, offset)
    results = []
    for r in records:
        class_meta = CLASS_METADATA.get(r.predicted_class, {"name": r.predicted_class})
        results.append({
            "id": r.id,
            "predicted_class": r.predicted_class,
            "predicted_class_name": class_meta["name"],
            "confidence": r.confidence,
            "model_name": r.model_name,
            "model_version": r.model_version,
            "image_path": r.image_path,
            "explainability_overlay_path": r.explainability_overlay_path,
            "created_at": r.created_at
        })
    return results

@router.get("/{prediction_id}", response_model=PredictionDetail)
def get_prediction_detail(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pred = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found.")
    if pred.user_id != current_user.id and current_user.role.value != "ADMIN":
        raise HTTPException(status_code=403, detail="Unauthorized access to this prediction record.")
    
    probs = {p.class_name: p.probability for p in pred.probabilities}
    class_meta = CLASS_METADATA.get(pred.predicted_class, {"name": pred.predicted_class})

    return {
        "id": pred.id,
        "predicted_class": pred.predicted_class,
        "predicted_class_name": class_meta["name"],
        "confidence": pred.confidence,
        "model_name": pred.model_name,
        "model_version": pred.model_version,
        "image_path": pred.image_path,
        "explainability_overlay_path": pred.explainability_overlay_path,
        "explainability_heatmap_path": pred.explainability_heatmap_path,
        "probabilities": probs,
        "notes": pred.notes,
        "disclaimer": settings.MEDICAL_DISCLAIMER,
        "created_at": pred.created_at
    }

@router.delete("/{prediction_id}")
def delete_user_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return delete_prediction(db, prediction_id, current_user)
