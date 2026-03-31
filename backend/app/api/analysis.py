from fastapi import APIRouter, HTTPException
import os
from app.services.extractor import extract_action_items_and_decisions

router = APIRouter()
UPLOAD_DIR = "uploads"

@router.get("/{filename}")
async def analyze_meeting(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Check if the transcript actually exists
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Transcript not found")
        
    # Call our extractor service to analyze the text
    analysis_result = extract_action_items_and_decisions(file_path)
    
    return {
        "filename": filename,
        "analysis": analysis_result
    }