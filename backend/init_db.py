"""
Database initialization script for DermaScan AI.
Sets up tables and seeds initial benchmark model records and development users.
Usage:
    python -m backend.init_db
"""
import json
import os
from backend.app.database import engine, Base, SessionLocal
from backend.app.models.user import User, UserRole
from backend.app.models.model_version import ModelVersion
from backend.app.dependencies import get_password_hash

def init_database():
    print("Creating tables in database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Seed initial models if not present
        comp_file = os.path.join("ml", "reports", "model_comparison.json")
        if os.path.exists(comp_file):
            with open(comp_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                for m in data.get("models", []):
                    existing = db.query(ModelVersion).filter(ModelVersion.model_id == m["model_id"]).first()
                    if not existing:
                        mv = ModelVersion(
                            model_id=m["model_id"],
                            model_name=m["model_name"],
                            version=m["version"],
                            architecture=m["architecture"],
                            dataset=data["dataset"]["name"],
                            metrics_json=json.dumps(m["metrics"]),
                            model_path=f"ml/models/{m['model_id']}.keras",
                            is_active=m.get("is_active", False)
                        )
                        db.add(mv)
            db.commit()
            print("Model metadata versions seeded.")

        # Seed sample research user if no users exist
        if db.query(User).count() == 0:
            demo_admin = User(
                name="Dr. Eleanor Vance",
                email="admin@dermascan.ai",
                password_hash=get_password_hash("DermaScan2026!"),
                role=UserRole.ADMIN,
                is_active=True
            )
            demo_researcher = User(
                name="Dr. Alex Rivera",
                email="researcher@dermascan.ai",
                password_hash=get_password_hash("ResearchPass2026!"),
                role=UserRole.RESEARCHER,
                is_active=True
            )
            demo_doctor = User(
                name="Dr. Sarah Chen, MD",
                email="doctor@dermascan.ai",
                password_hash=get_password_hash("DoctorPass2026!"),
                role=UserRole.DOCTOR,
                is_active=True
            )
            db.add_all([demo_admin, demo_researcher, demo_doctor])
            db.commit()
            print("Development researcher, doctor, and admin accounts seeded.")
            print("Admin: admin@dermascan.ai / DermaScan2026!")
            print("Doctor: doctor@dermascan.ai / DoctorPass2026!")
            print("Researcher: researcher@dermascan.ai / ResearchPass2026!")

        print("Database initialized successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
