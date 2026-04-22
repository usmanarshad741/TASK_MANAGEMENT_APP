from fastapi import FastAPI
from SRC.utils.db import Base, engine
from SRC.TASK import models  # Import all models
from SRC.TASK.router import task_router
from SRC.TASK.auth_controller import auth_router  # ← Import auth router


# Create tables (this creates the SQLite database file)
print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")

app = FastAPI(title="Task Management API with Authentication")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(task_router)
app.include_router(auth_router)  # ← Include auth router
@app.get("/")
def root():
    return {"message": "Task Management API with JWT Authentication"}


