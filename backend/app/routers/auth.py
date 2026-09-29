from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.dependencies import get_current_user, verify_password, get_password_hash
from backend.app.models.user import User
from backend.app.schemas.auth import UserRegister, UserLogin, Token, UserOut, PasswordChange
from backend.app.services.auth_service import register_user, authenticate_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    user = register_user(db, user_data)
    user_auth, token = authenticate_user(db, UserLogin(email=user_data.email, password=user_data.password))
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_auth
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user, token = authenticate_user(db, login_data)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/change-password")
def change_password(payload: PasswordChange, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not verify_password(payload.current_password, current_user.password_hash):
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Current password does not match.")
    current_user.password_hash = get_password_hash(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully."}
