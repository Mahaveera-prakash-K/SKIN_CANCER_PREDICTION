from datetime import datetime
from typing import Dict, Optional, Any
from pydantic import BaseModel, Field

class ModelMetaInfo(BaseModel):
    name: str
    version: str
    architecture: Optional[str] = None

class ExplainabilityData(BaseModel):
    original_image: str
    heatmap: str
    overlay: str
    layer_name: Optional[str] = "top_conv"
    method: str = "Grad-CAM"
    explanation_note: str = (
        "Highlighted regions indicate image areas that contributed to the model's prediction. "
        "This visualization is an AI explainability aid and should not be interpreted as clinical evidence."
    )

class PredictionResponse(BaseModel):
    prediction_id: int
    predicted_class: str
    predicted_class_name: str
    confidence: float
    probabilities: Dict[str, float]
    model: ModelMetaInfo
    explainability: ExplainabilityData
    disclaimer: str
    created_at: datetime
    dermoscopic_features: Optional[Dict[str, Any]] = None

class PredictionSummary(BaseModel):
    id: int
    predicted_class: str
    predicted_class_name: str
    confidence: float
    model_name: str
    model_version: str
    image_path: str
    explainability_overlay_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PredictionDetail(PredictionSummary):
    probabilities: Dict[str, float]
    explainability_heatmap_path: Optional[str] = None
    notes: Optional[str] = None
    disclaimer: str
