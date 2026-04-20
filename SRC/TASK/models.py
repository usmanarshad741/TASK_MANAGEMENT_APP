from sqlalchemy import Column, Integer, String, Boolean
from SRC.utils.db import Base   


class Task(Base):
    __tablename__ = "user_tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, index=True)
    completed = Column(Boolean, default=False)

