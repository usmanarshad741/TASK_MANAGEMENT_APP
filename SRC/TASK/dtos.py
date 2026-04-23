from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskSchema(BaseModel):
    title: str
    description: str
    completed: bool = False
    
    model_config = {"from_attributes": True}

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    completed: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    model_config = {"from_attributes": True}

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# ✅ New: Password reset schemas
class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    # Forgot Password DTOs
class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str