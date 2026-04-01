from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from app.database import get_db
from app.models import Meeting

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
async def upload_transcripts(files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    saved_files = []
    
    for file in files:
        if not (file.filename.endswith('.txt') or file.filename.endswith('.vtt')):
            raise HTTPException(status_code=400, detail=f"Unsupported format: {file.filename}")
            
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        
        # Save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Check if file already exists in database
        existing_meeting = db.query(Meeting).filter(Meeting.filename == file.filename).first()
        if not existing_meeting:
            # Save record to Database
            db_meeting = Meeting(filename=file.filename, status="Processed")
            db.add(db_meeting)
            db.commit()
            db.refresh(db_meeting)
            
        saved_files.append({"filename": file.filename})
        
    return {"message": "Files uploaded and logged to database successfully", "files": saved_files}

# NEW ENDPOINT: Get all past meetings for the dashboard
@router.get("/history")
def get_meeting_history(db: Session = Depends(get_db)):
    meetings = db.query(Meeting).order_by(Meeting.upload_date.desc()).all()
    return meetings