import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.config import settings
from backend.app.database import engine, Base
from backend.app.routers import auth, users, predictions, models, health

# Create database tables automatically
Base.metadata.create_all(bind=engine)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="DermaScan AI API",
    description=(
        "Research Prototype API for AI-assisted skin lesion image classification, "
        "model benchmarking, and Grad-CAM explainability on the HAM10000 dataset.\n\n"
        "**Medical Disclaimer:** This system is an AI research prototype. It does not provide medical diagnosis."
    ),
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static folder
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Mount API routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(predictions.router)
app.include_router(models.router)

# Secure exception handler - Never expose raw Python tracebacks to client
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import logging
    logging.getLogger("uvicorn.error").error(f"Internal server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong while processing the image or request."}
    )

@app.get("/")
def root():
    return {
        "message": "DermaScan AI Research API",
        "documentation": "/docs",
        "health": "/api/health",
        "disclaimer": settings.MEDICAL_DISCLAIMER
    }
