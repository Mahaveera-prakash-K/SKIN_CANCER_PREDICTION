from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.models.user import User, UserRole
from backend.app.schemas.auth import UserRegister, UserLogin
from backend.app.dependencies import get_password_hash, verify_password, create_access_token

def register_user(db: Session, reg_data: UserRegister) -> User:
    existing = db.query(User).filter(User.email == reg_data.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # First user can be made ADMIN if wanted, otherwise use requested role
    user_count = db.query(User).count()
    assigned_role = UserRole.ADMIN if user_count == 0 else reg_data.role

    new_user = User(
        name=reg_data.name.strip(),
        email=reg_data.email.lower().strip(),
        password_hash=get_password_hash(reg_data.password),
        role=assigned_role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def authenticate_user(db: Session, login_data: UserLogin):
    user = db.query(User).filter(User.email == login_data.email.lower().strip()).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Contact the research team administrator."
        )
    
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return user, access_token
