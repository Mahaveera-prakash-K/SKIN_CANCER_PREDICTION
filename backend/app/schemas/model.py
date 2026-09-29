from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class ModelMetrics(BaseModel):
    test_accuracy: float
    macro_precision: float
    macro_recall: float
    macro_f1: float
    weighted_precision: float
    weighted_recall: float
    weighted_f1: float
    roc_auc_ovr: float
    macro_sensitivity: float
    macro_specificity: float

class ModelVersionOut(BaseModel):
    id: int
    model_id: str
    model_name: str
    version: str
    architecture: str
    dataset: str
    is_active: bool
    parameters: int
    inference_time_ms: float
    metrics: ModelMetrics
    class_metrics: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class ModelComparisonResponse(BaseModel):
    dataset_info: Dict[str, Any]
    models: List[ModelVersionOut]
    active_model_id: str
    note: str = "Model selection should consider multiple metrics and clinical/research requirements, not accuracy alone."
