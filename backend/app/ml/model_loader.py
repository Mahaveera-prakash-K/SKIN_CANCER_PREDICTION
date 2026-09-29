import os
import json
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class ModelRegistry:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelRegistry, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self.active_model = None
        self.active_model_id = "effnetv2-b0-v1"
        self.comparison_data = None
        self.classification_report = None
        self.load_metadata()
        self._initialized = True

    def load_metadata(self):
        try:
            comparison_path = os.path.join("ml", "reports", "model_comparison.json")
            if os.path.exists(comparison_path):
                with open(comparison_path, "r", encoding="utf-8") as f:
                    self.comparison_data = json.load(f)
            
            report_path = os.path.join("ml", "reports", "classification_report.json")
            if os.path.exists(report_path):
                with open(report_path, "r", encoding="utf-8") as f:
                    self.classification_report = json.load(f)
        except Exception as e:
            logger.warning(f"Could not load ML reports: {e}")

    def get_active_model_meta(self) -> Dict[str, Any]:
        if not self.comparison_data or "models" not in self.comparison_data:
            return {
                "model_id": "effnetv2-b0-v1",
                "model_name": "EfficientNetV2-B0",
                "version": "1.0.0",
                "architecture": "EfficientNetV2-B0",
                "is_active": True
            }
        
        for m in self.comparison_data["models"]:
            if m.get("model_id") == self.active_model_id:
                return m
        return self.comparison_data["models"][0]

    def set_active_model(self, model_id: str) -> bool:
        if not self.comparison_data:
            return False
        for m in self.comparison_data.get("models", []):
            if m.get("model_id") == model_id:
                for other in self.comparison_data["models"]:
                    other["is_active"] = (other["model_id"] == model_id)
                self.active_model_id = model_id
                return True
        return False

model_registry = ModelRegistry()
