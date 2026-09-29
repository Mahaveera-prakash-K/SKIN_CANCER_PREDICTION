from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.dependencies import get_current_user, require_roles
from backend.app.models.user import User, UserRole
from backend.app.schemas.auth import UserOut, ProfileUpdate

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/profile", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # count user's predictions
    from backend.app.models.prediction import Prediction
    count = db.query(Prediction).filter(Prediction.user_id == current_user.id).count()
    current_user.prediction_count = count
    return current_user

@router.put("/profile", response_model=UserOut)
def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.name = payload.name.strip()
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/admin/users", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    users = db.query(User).all()
    from backend.app.models.prediction import Prediction
    for u in users:
        u.prediction_count = db.query(Prediction).filter(Prediction.user_id == u.id).count()
    return users

@router.patch("/admin/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found.")
    target.is_active = is_active
    db.commit()
    return {"message": f"User active status updated to {is_active}."}

@router.patch("/admin/users/{user_id}/role")
def change_user_role(
    user_id: int,
    role: UserRole,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found.")
    target.role = role
    db.commit()
    return {"message": f"User role updated to {role.value}."}
