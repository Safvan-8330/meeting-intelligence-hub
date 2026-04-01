from fastapi import APIRouter, HTTPException
import os
from app.services.sentiment import analyze_meeting_sentiment

router = APIRouter()
UPLOAD_DIR = "uploads"

@router.get("/{filename}")
async def get_sentiment(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Transcript not found")
        
    analysis_result = analyze_meeting_sentiment(file_path)
    
    return {
        "filename": filename,
        "sentiment_data": analysis_result
    }