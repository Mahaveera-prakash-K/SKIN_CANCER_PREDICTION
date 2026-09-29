from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from backend.app.models.user import UserRole

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole = UserRole.RESEARCHER

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime
    prediction_count: int = 0

    class Config:
        from_attributes = True

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)

class ProfileUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)

Token.update_forward_refs()
