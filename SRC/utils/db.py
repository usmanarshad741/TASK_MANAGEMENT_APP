from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from SRC.utils.settings import settings

# SQLite specific configuration
# The "check_same_thread" is needed for SQLite to work with multiple threads
engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Required for SQLite
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

