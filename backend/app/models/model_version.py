from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from backend.app.database import Base

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(String(100), unique=True, index=True, nullable=False)
    model_name = Column(String(100), nullable=False)
    version = Column(String(50), nullable=False)
    architecture = Column(String(200), nullable=False)
    dataset = Column(String(200), nullable=False)
    metrics_json = Column(Text, nullable=False)
    model_path = Column(String(500), nullable=False)
    is_active = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
