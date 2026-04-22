from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from SRC.TASK import controller
from SRC.TASK.dtos import TaskSchema
from SRC.utils.db import get_db
from SRC.utils.auth import get_current_user
from SRC.TASK.models import User

task_router = APIRouter(prefix="/tasks")

# Public routes (no authentication needed)
@task_router.get("/")
def root():
    return {"message": "Task Management API"}

# ✅ Protected routes (authentication required)
@task_router.post("/create")
def create_task(
    body: TaskSchema, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ← Authentication ADDED
):
    return controller.create_task(body, db)

# ✅ UPDATED: Pagination parameters ADDED + Authentication
@task_router.get("/alltasks")
def get_tasks(
    skip: int = 0,           # ← NEW: Query parameter for offset
    limit: int = 10,         # ← NEW: Query parameter for limit
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ← Authentication ADDED
):
    return controller.get_tasks(db, skip, limit)

# ✅ Authentication ADDED
@task_router.get("/task/{task_id}")
def get_task(
    task_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ← Authentication ADDED
):
    return controller.get_task(task_id, db)

# ✅ Authentication ADDED
@task_router.put("/task/{task_id}")
def update_task(
    task_id: int, 
    body: TaskSchema, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ← Authentication ADDED
):
    return controller.update_task(task_id, body, db)

# ✅ Authentication ADDED
@task_router.delete("/task/{task_id}")
def delete_task(
    task_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ← Authentication ADDED
):
    return controller.delete_task(task_id, db)


