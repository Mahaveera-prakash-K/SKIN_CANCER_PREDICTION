import os
import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from PIL import Image

from backend.app.models.prediction import Prediction, PredictionProbability
from backend.app.models.user import User, UserRole
from backend.app.ml.preprocessing import validate_image_bytes, CLASS_METADATA
from backend.app.ml.inference import run_lesion_inference
from backend.app.config import settings

def process_and_save_prediction(
    db: Session,
    user: User,
    image_bytes: bytes,
    filename: str,
    notes: Optional[str] = None
) -> dict:
    # 1. Validate image
    try:
        pil_img = validate_image_bytes(image_bytes, max_size_mb=settings.MAX_UPLOAD_SIZE_MB)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    # 2. Run genuine inference
    try:
        res = run_lesion_inference(pil_img)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing skin lesion image during neural inference."
        )

    # 3. Save uploaded image to disk
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    clean_filename = f"{uuid.uuid4().hex}_{user.id}.png"
    save_path = os.path.join(settings.UPLOAD_DIR, clean_filename)
    pil_img.save(save_path, format="PNG")

    # 4. Save to database
    db_prediction = Prediction(
        user_id=user.id,
        image_path=f"/uploads/{clean_filename}",
        predicted_class=res["predicted_class"],
        confidence=res["confidence"],
        model_name=res["model"]["name"],
        model_version=res["model"]["version"],
        explainability_heatmap_path=res["explainability"]["heatmap"],
        explainability_overlay_path=res["explainability"]["overlay"],
        notes=notes
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)

    # Save class probabilities
    for cls_name, prob in res["probabilities"].items():
        prob_entry = PredictionProbability(
            prediction_id=db_prediction.id,
            class_name=cls_name,
            probability=prob
        )
        db.add(prob_entry)
    db.commit()

    return {
        "prediction_id": db_prediction.id,
        "predicted_class": res["predicted_class"],
        "predicted_class_name": res["predicted_class_name"],
        "confidence": res["confidence"],
        "probabilities": res["probabilities"],
        "model": res["model"],
        "explainability": {
            "original_image": f"/uploads/{clean_filename}",
            "heatmap": res["explainability"]["heatmap"],
            "overlay": res["explainability"]["overlay"],
            "layer_name": res["explainability"]["layer_name"],
            "method": res["explainability"]["method"],
            "explanation_note": (
                "Highlighted regions indicate image areas that contributed to the model's prediction. "
                "This visualization is an AI explainability aid and should not be interpreted as clinical evidence."
            )
        },
        "dermoscopic_features": res["dermoscopic_features"],
        "disclaimer": settings.MEDICAL_DISCLAIMER,
        "created_at": db_prediction.created_at
    }

def get_user_predictions(db: Session, user: User, limit: int = 100, offset: int = 0) -> List[Prediction]:
    query = db.query(Prediction)
    if user.role != UserRole.ADMIN:
        query = query.filter(Prediction.user_id == user.id)
    return query.order_by(Prediction.created_at.desc()).offset(offset).limit(limit).all()

def delete_prediction(db: Session, prediction_id: int, user: User):
    pred = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not pred:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction record not found.")
    
    if pred.user_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to delete this prediction.")

    db.delete(pred)
    db.commit()
    return {"message": "Prediction record deleted successfully."}
