from pydantic import BaseModel
from typing import Optional 
 
class TaskSchema(BaseModel):
    title: str
    description: str
    completed: bool = False

    # ✅ New Auth Schemas
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
    

