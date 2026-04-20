from SRC.TASK.dtos import TaskSchema
from sqlalchemy.orm import Session
from fastapi import HTTPException


from SRC.TASK.models import Task
def create_task(body: TaskSchema ,db: Session):
    task = Task(**body.model_dump())
    new_task = Task(title = body.title, description = body.description, completed = body.completed)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return {"message": "Task created successfully", "task": new_task}    

def get_tasks(db: Session):
    tasks = db.query(Task).all()
    return {"status":"alltasks", "data": tasks}

def get_one_task(task_id: int, db: Session):
    get_one_task = db.query(Task).get(task_id)
    if not get_one_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"status": "success", "data": get_one_task}



def update_one_task(task_id: int, body: TaskSchema, db: Session):
    task = db.query(Task).get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.title = body.title
    task.description = body.description
    task.completed = body.completed
    db.commit()
    db.refresh(task)
    return {"message": "Task updated successfully", "task": task}  
     


