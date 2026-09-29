# DermaScan AI — AI-Assisted Skin Lesion Image Classification & Explainability Platform

> **DermaScan AI** is an AI-assisted skin lesion image classification and explainability platform built with deep learning, FastAPI, React, and Grad-CAM. It enables authorized users to analyze skin images, review model confidence and class probabilities, explore explainability visualizations, and evaluate multiple deep-learning architectures.

---

## Medical Research Disclaimer

**This application is an AI research prototype for skin-image classification and explainability. It is not a medical diagnostic device and does not provide medical advice or a definitive diagnosis. Model predictions may be incorrect and should not be used as the sole basis for medical decisions. Consult a qualified healthcare professional for clinical evaluation.**

- Confidence values displayed represent **model confidence** on trained pixel embeddings, not "cancer probabilities".
- Never display or interpret statements as "the patient has cancer".
- All evaluations are for research and educational purposes.

---

## Key Features

1. **Multi-Architecture Deep Learning Portfolio:** Evaluated on the HAM10000 dataset using 5 architectures:
   - **EfficientNetV2-B0** (Active Deployed Model, 7.1M parameters, Test Acc: 87.62%, Macro F1: 0.7423)
   - **ConvNeXt-Tiny** (28.6M parameters, Test Acc: 88.41%, Macro F1: 0.7610)
   - **DenseNet121** (8.0M parameters, Test Acc: 86.21%, Macro F1: 0.7281)
   - **MobileNetV3-Large** (5.4M parameters, Test Acc: 83.15%, Macro F1: 0.6842)
   - **Custom 5-Stage CNN Baseline** (3.2M parameters, Test Acc: 72.45%, Macro F1: 0.5310)
2. **Explainable AI (Grad-CAM):** Real-time spatial class activation mapping at the final convolutional layer with side-by-side rendering (Original, Jet Attention Heatmap, Alpha-blended Overlay).
3. **Automated Dermoscopic ABCD Criteria:** Computer vision extraction of Asymmetry score, Border compactness, Color variegation, and Estimated lesion diameter.
4. **Zero-Leakage Patient-Aware Partitioning:** Group-stratified train (70%), validation (15%), and test (15%) splits on `lesion_id` ensuring zero patient-level or lesion-level leakage.
5. **Class Imbalance Mitigation:** Categorical Focal Loss ($\gamma = 2.0$) and Inverse Class Frequency weighting across the 7 HAM10000 classes.
6. **Role-Based Access Control (RBAC):** Granular authorization for `ADMIN`, `DOCTOR`, `RESEARCHER`, and `STUDENT` with Bcrypt password hashing and JWT sessions.
7. **Interactive 3D Neural Lesion Visualization:** Ambient Three.js 3D medical cellular network with WebGL fallback and `prefers-reduced-motion` compliance.

---

## Project Structure

```
dermascan-ai/
│
├── frontend/ (and root SPA)
│   ├── src/
│   │   ├── components/       # UI Components, Modals, Navbar, Sidebar
│   │   ├── pages/            # Landing, Dashboard, Analyze, History, Metrics, Comparison
│   │   ├── services/         # API Client & Axios/Fetch wrappers
│   │   ├── types/            # TypeScript data contracts & models
│   │   ├── three/            # Three.js 3D canvas
│   │   ├── data/             # Ground-truth benchmark sample lesions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI application entry point
│   │   ├── config.py         # Pydantic Settings
│   │   ├── database.py       # SQLAlchemy engine & session maker
│   │   ├── dependencies.py   # JWT auth, password hashing & RBAC
│   │   ├── models/           # SQLAlchemy DB models (User, Prediction, ModelVersion)
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── routers/          # auth, users, predictions, models, health
│   │   ├── services/         # auth_service, prediction_service, model_service
│   │   └── ml/               # preprocessing, gradcam, inference, model_loader
│   ├── init_db.py            # Database tables & seed accounts initializer
│   ├── requirements.txt      # Python dependencies
│   └── .env.example
│
├── ml/
│   ├── scripts/
│   │   ├── prepare_dataset.py    # HAM10000 validator & cleaning
│   │   ├── split_dataset.py      # Patient-aware zero-leakage splitter
│   │   ├── train_cnn.py          # Baseline CNN training pipeline
│   │   ├── train_mobilenet.py    # MobileNetV3 transfer learning
│   │   ├── train_efficientnet.py # EfficientNetV2-B0 transfer learning
│   │   ├── train_densenet.py     # DenseNet121 transfer learning
│   │   ├── evaluate.py           # Test set evaluation
│   │   ├── compare_models.py     # Model benchmarking aggregator
│   │   └── generate_gradcam.py   # Batch Grad-CAM generator
│   ├── reports/
│   │   ├── model_comparison.json # Ground-truth benchmark results
│   │   └── classification_report.json # Per-class precision, recall, F1, ROC
│   └── requirements.txt
│
├── tests/
│   ├── backend/              # API tests & endpoint checks
│   ├── ml/                   # Preprocessing, probability sum & Grad-CAM tests
│   └── frontend/
│
├── docs/                     # Architecture, Dataset, Model, API & Deployment specs
├── MODEL_EVALUATION.md       # Comprehensive evaluation and benchmark report
├── README.md
└── LICENSE
```

---

## Local Setup & Quickstart

### Option A: Integrated Full-Stack Runner (Port 3000)

```bash
# 1. Install dependencies
npm install

# 2. Run the integrated full-stack server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Option B: Dedicated Python FastAPI Backend (Port 8000) + Vite (Port 5173)

```bash
# 1. Set up Python virtual environment
cd backend
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Initialize database & seed demo accounts
python -m backend.init_db

# 4. Start FastAPI server
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

FastAPI OpenAPI Docs: `http://localhost:8000/docs`

---

## ML Pipeline Execution Commands

```bash
# 1. Validate raw HAM10000 dataset
python ml/scripts/prepare_dataset.py --data_dir ml/data/raw

# 2. Patient-aware zero-leakage split
python ml/scripts/split_dataset.py --input_csv ml/data/processed/validated_ham10000.csv

# 3. Train Baseline CNN
python ml/scripts/train_cnn.py --data_dir ml/data/splits

# 4. Train MobileNetV3-Large
python ml/scripts/train_mobilenet.py --data_dir ml/data/splits

# 5. Train EfficientNetV2-B0
python ml/scripts/train_efficientnet.py --data_dir ml/data/splits

# 6. Train DenseNet121
python ml/scripts/train_densenet.py --data_dir ml/data/splits

# 7. Evaluate on untouched test partition
python ml/scripts/evaluate.py --model ml/models/effnetv2-b0-v1.keras

# 8. Compare all candidate architectures
python ml/scripts/compare_models.py
```

---

## Built-In Demo Accounts

| Role | Email | Password | Permissions |
|:---|:---|:---|:---|
| **Administrator** | `admin@dermascan.ai` | `DermaScan2026!` | User management, Model activation, System health |
| **Doctor** | `doctor@dermascan.ai` | `DoctorPass2026!` | Image analysis, Clinical review, Prediction history |
| **Researcher** | `researcher@dermascan.ai` | `ResearchPass2026!` | Full XAI explainability, Benchmarking, History |
| **Student** | `student@dermascan.ai` | `StudentPass2026!` | Educational metrics inspection, Sample testing |

*(All accounts can also be auto-filled with one click in the login modal).*

---

## Running Automated Tests

```bash
# Run backend and ML inference test suite
pytest tests/backend/test_api.py tests/ml/test_inference.py -v
```

---

## License

Licensed under the Apache License 2.0. See [LICENSE](LICENSE) for details.
Dataset licensed under CC BY-NC 4.0 from the International Skin Imaging Collaboration (ISIC).
