# DermaScan AI — REST API Documentation

## Base URLs
- Local Development: `http://localhost:3000/api` or `http://localhost:8000/api`
- Interactive OpenAPI Docs: `/docs`
- Interactive ReDoc: `/redoc`

## Endpoints

### 1. Health Check
- `GET /api/health`
- Response: Status of database, loaded model name, version, and disclaimer.

### 2. Authentication
- `POST /api/auth/register`: Register new account with role (`ADMIN`, `DOCTOR`, `RESEARCHER`, `STUDENT`).
- `POST /api/auth/login`: Authenticate and obtain JWT token.
- `GET /api/auth/me`: Fetch currently logged-in user profile.
- `POST /api/auth/change-password`: Update account password.

### 3. Lesion Inference & Predictions
- `POST /api/predictions/predict`: Multipart form upload with `image` file and optional `notes`.
  Returns predicted lesion class, model confidence, full 7-class probabilities, dermoscopic ABCD metrics, and Grad-CAM original/heatmap/overlay base64 URIs.
- `GET /api/predictions`: List previous predictions for current user (or all if admin).
- `GET /api/predictions/{id}`: Detailed prediction result.
- `DELETE /api/predictions/{id}`: Delete prediction record.

### 4. Models & Benchmarks
- `GET /api/models`: List all candidate evaluated models with benchmark metrics.
- `GET /api/models/active`: Retrieve metadata of currently active deployed model.
- `GET /api/models/metrics`: Full evaluation report (confusion matrix, ROC curves, per-class metrics).
- `POST /api/models/{model_id}/activate`: Switch active model (Admin role required).
