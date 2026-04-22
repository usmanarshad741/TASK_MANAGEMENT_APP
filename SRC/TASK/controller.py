from sqlalchemy import func  # ← IMPORT 1: YE ADD KARO
from SRC.TASK.dtos import TaskSchema
from sqlalchemy.orm import Session
from fastapi import HTTPException
from SRC.TASK.models import Task

def create_task(body: TaskSchema, db: Session):
    new_task = Task(title=body.title, description=body.description, completed=body.completed)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return {"message": "Task created successfully", "task": new_task}    

# ← FUNCTION 2: UPDATED  (pagination parameters added)
def get_tasks(db: Session, skip: int = 0, limit: int = 10):
    total_tasks = db.query(Task).count()
    tasks = db.query(Task).offset(skip).limit(limit).all()
    
    tasks_data = [
        {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed
        }
        for task in tasks
    ]
    
    return {
        "status": "alltasks",
        "data": tasks_data,
        "pagination": {
            "total": total_tasks,
            "skip": skip,
            "limit": limit,
            "next_skip": skip + limit if skip + limit < total_tasks else None,
            "previous_skip": skip - limit if skip - limit >= 0 else None,
            "total_pages": (total_tasks + limit - 1) // limit,
            "current_page": (skip // limit) + 1 if limit > 0 else 1
        }
    }

def get_task(task_id: int, db: Session):
    task = db.query(Task).get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {
        "status": "success", 
        "data": {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed
        }
    }

def update_task(task_id: int, body: TaskSchema, db: Session):
    task = db.query(Task).get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.title = body.title
    task.description = body.description
    task.completed = body.completed
    
    db.commit()
    db.refresh(task)
    
    return {
        "message": "Task updated successfully", 
        "task": {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed
        }
    }

def delete_task(task_id: int, db: Session):
    task = db.query(Task).get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    
    return {"message": f"Task with id {task_id} deleted successfully"}


