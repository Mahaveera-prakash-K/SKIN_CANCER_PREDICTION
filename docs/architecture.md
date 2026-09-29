# DermaScan AI — Architecture Specification

## Overview
DermaScan AI is an academic and clinical-research grade platform designed for AI-assisted dermatoscopic skin lesion classification and model explainability. It operates on a modular, decoupled full-stack architecture combining deep learning computer vision, RESTful APIs, role-based authorization, and real-time visualization.

```
                          ┌────────────────────────┐
                          │   React 19 Frontend    │
                          │   Tailwind + Three.js  │
                          └───────────┬────────────┘
                                      │
                     HTTPS / JSON / Multipart File Stream
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │    FastAPI / Express API      │
                      │    Authentication & CORS      │
                      └───────┬───────────────┬───────┘
                              │               │
                              ▼               ▼
                      ┌──────────────┐ ┌─────────────────────────┐
                      │  SQLAlchemy  │ │   ML Inference Engine   │
                      │ SQLite / PG  │ │ Preprocessing + ABCD    │
                      └──────────────┘ │ Grad-CAM Explainability │
                                       │ Active Keras Model      │
                                       └─────────────────────────┘
```

## Security & Regulatory Architecture
- **Non-Diagnostic Policy:** The platform strictly identifies as a research prototype. It does not provide medical diagnoses or replace physician consultation.
- **Data Minimization:** No personally identifiable health information (PHI) such as patient names, phone numbers, or government identifiers are stored.
- **Authorization:** Granular Role-Based Access Control (`ADMIN`, `DOCTOR`, `RESEARCHER`, `STUDENT`) with Argon2/Bcrypt password hashing and short-lived JWTs.
- **Path Traversal & MIME Protection:** Uploaded images are re-encoded and stored under UUIDs with validated MIME types.
