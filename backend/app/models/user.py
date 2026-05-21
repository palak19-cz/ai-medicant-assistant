from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    name:     str       = Field(..., min_length=2, max_length=100)
    email:    EmailStr
    phone:    str       = Field(..., min_length=7, max_length=20)
    password: str       = Field(..., min_length=8)


class UserLogin(BaseModel):
    email:    EmailStr
    password: str


class UserOut(BaseModel):
    id:         str
    name:       str
    email:      str
    phone:      str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         UserOut


class UserInDB(BaseModel):
    """Internal model — stored in MongoDB"""
    name:            str
    email:           str
    phone:           str
    hashed_password: str
    created_at:      datetime = Field(default_factory=datetime.utcnow)
    is_active:       bool     = True
