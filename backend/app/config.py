import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "DermaScan AI Backend"
    APP_VERSION: str = "1.0.0"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./dermascan.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dermascan-super-secure-production-research-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    CORS_ORIGINS: list[str] = [
        origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,*").split(",") if origin.strip()
    ]
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
    MODEL_PATH: str = os.getenv("MODEL_PATH", "./ml/models/effnetv2-b0-v1.keras")
    ACTIVE_MODEL_ID: str = "effnetv2-b0-v1"

    MEDICAL_DISCLAIMER: str = (
        "This application is an AI research prototype for skin-image classification. "
        "It does not provide a medical diagnosis and should not replace evaluation by a qualified healthcare professional."
    )

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
