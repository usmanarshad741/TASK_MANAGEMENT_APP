from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from SRC.utils.db import Base, engine
from SRC.TASK import models
from SRC.TASK.router import task_router
from SRC.TASK.auth_controller import auth_router

# FastAPI app initialization
app = FastAPI(title="Task Management API with Authentication")

# CORS Middleware - Sab se pehle, sabse important!
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://task-management-app-ten-tan.vercel.app",
        "https://task-management-8h06sijej-usmanarshad741s-projects.vercel.app",
        "https://task-management-app-dps.netlify.app",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")

# Include routers
app.include_router(task_router)
app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "Task Management API with JWT Authentication"}

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Server is running"}