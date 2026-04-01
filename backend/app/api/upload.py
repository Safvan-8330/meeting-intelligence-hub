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

import uuid
from app.services.transcriber import transcribe_audio_file

@router.post("/live-voice")
async def handle_live_voice(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # 1. Save the temporary audio file
    temp_filename = f"live_{uuid.uuid4()}.wav"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 2. Convert Audio to Text
    transcript_text = transcribe_audio_file(temp_path)
    
    if not transcript_text:
        raise HTTPException(status_code=400, detail="Could not understand audio")

    # 3. Save the transcript as a .txt file so our existing system can use it
    final_filename = f"Voice_Meeting_{uuid.uuid4().hex[:6]}.txt"
    final_path = os.path.join(UPLOAD_DIR, final_filename)
    
    with open(final_path, "w", encoding="utf-8") as f:
        f.write(transcript_text)
        
    # 4. Log to Database
    db_meeting = Meeting(filename=final_filename, status="Processed")
    db.add(db_meeting)
    db.commit()
    
    return {"filename": final_filename, "text": transcript_text}