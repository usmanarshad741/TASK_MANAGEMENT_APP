from fastapi import FastAPI
from SRC.utils.db import Base, engine
from SRC.TASK.models import Task  # Import your model
from SRC.TASK.router import task_router
# Create tables (this creates the SQLite database file)
print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")

app = FastAPI()

app.include_router(task_router)

@app.get("/")
def root():
    return {"message": "Task Management API"}