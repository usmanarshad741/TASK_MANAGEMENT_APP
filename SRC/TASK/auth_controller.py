from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from SRC.TASK import models
from SRC.TASK.dtos import UserCreate, UserLogin, Token, ForgotPasswordRequest, ResetPasswordRequest
from SRC.utils.db import get_db
from SRC.utils.auth import (
    get_password_hash, authenticate_user, create_access_token, get_current_user,
    create_reset_token, reset_password
)
from SRC.utils.settings import settings

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

@auth_router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register new user"""
    existing_user = db.query(models.User).filter(
        (models.User.username == user.username) | (models.User.email == user.email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@auth_router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    user_db = authenticate_user(db, user.username, user.password)
    if not user_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@auth_router.get("/me")
def get_me(current_user: models.User = Depends(get_current_user)):
    """Get current user info"""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "is_active": current_user.is_active
    }

# ✅ New: Forgot password endpoint
@auth_router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Request password reset"""
    token = create_reset_token(db, request.email)
    
    if not token:
        # Return success even if email not found (security best practice)
        return {"message": "If email exists, reset link will be sent"}
    
    # In production, send email here
    # For now, return token in response (for testing)
    reset_link = f"https://your-frontend-url.com/reset-password?token={token}"
    
    return {
        "message": "Password reset link generated",
        "reset_token": token,  # Remove in production, send via email
        "reset_link": reset_link
    }

# ✅ New: Reset password endpoint
@auth_router.post("/reset-password")
def reset_password_request(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using token"""
    success = reset_password(db, request.token, request.new_password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    return {"message": "Password reset successful"}