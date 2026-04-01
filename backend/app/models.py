from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, unique=True, index=True)
    upload_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Processed")
    
    # --- NEW COLUMNS ---
    word_count = Column(Integer, default=0)
    action_item_count = Column(Integer, default=0)