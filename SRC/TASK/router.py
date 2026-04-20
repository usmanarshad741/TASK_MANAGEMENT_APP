from fastapi import APIRouter, Depends

from SRC.TASK import controller
from SRC.TASK.controller import create_task 
from SRC.TASK.dtos import TaskSchema
from SRC.utils.db import get_db

task_router = APIRouter(prefix="/tasks")


@task_router.post("/create")
def create_task(body: TaskSchema, db = Depends(get_db)):
    return controller.create_task(body, db)

@task_router.get("/alltasks")
def get_tasks(db = Depends(get_db)):
    return controller.get_tasks(db)

@task_router.get("/one_task/{task_id}")
def get_one_task(task_id: int, db = Depends(get_db)):
    return controller.get_one_task(task_id, db)

@task_router.put("/update/{task_id}")
def update_one_task(task_id: int, body: TaskSchema, db = Depends(get_db)):
    return controller.update_one_task(task_id, body, db)