from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import os
import shutil

router = APIRouter()

# Ensure the uploads directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
async def upload_transcripts(files: List[UploadFile] = File(...)):
    saved_files = []
    
    for file in files:
        # Double-check validation on the backend [cite: 17, 20]
        if not (file.filename.endswith('.txt') or file.filename.endswith('.vtt')):
            raise HTTPException(status_code=400, detail=f"Unsupported file format: {file.filename}")
            
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        
        # Save the file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        saved_files.append({
            "filename": file.filename,
            "status": "uploaded",
            "path": file_path
        })
        
    return {"message": "Files uploaded successfully", "files": saved_files}