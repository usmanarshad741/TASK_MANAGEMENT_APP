from fastapi import FastAPI
from SRC.utils.db import Base, engine
from SRC.TASK import models  # Import all models
from SRC.TASK.router import task_router
from SRC.TASK.auth_controller import auth_router  # ← Import auth router
from fastapi.middleware.cors import CORSMiddleware


# Create tables (this creates the SQLite database file)
print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")

app = FastAPI(title="Task Management API with Authentication")

# CORS Middleware - Updated with all working URLs
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://task-management-8h06sijej-usmanarshad741s-projects.vercel.app",  # Naya Vercel URL
        "https://task-management-app-ten-tan.vercel.app",                         # Purana Vercel URL
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(task_router)
app.include_router(auth_router)  # ← Include auth router

@app.get("/")
def root():
    return {"message": "Task Management API with JWT Authentication"}