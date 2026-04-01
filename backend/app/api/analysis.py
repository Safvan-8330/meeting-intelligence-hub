from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
import os

from pydantic import BaseModel
from dotenv import load_dotenv
import google.genai as genai

from app.services.reporter import generate_pdf_report
from app.services.extractor import extract_action_items_and_decisions

# Load Gemini API key for any routes that call the model
load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/export/{filename}")
async def export_meeting_report(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    # Re-run extraction or pull from cache (we'll run fresh for now)
    analysis_result = extract_action_items_and_decisions(file_path)

    # Generate the PDF
    pdf_path = generate_pdf_report(filename, analysis_result)

    return FileResponse(
        path=pdf_path,
        filename=f"Report_{filename}.pdf",
        media_type='application/pdf'
    )


@router.get("/{filename}")
async def get_analysis(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Transcript not found")

    analysis_result = extract_action_items_and_decisions(file_path)

    return {
        "filename": filename,
        "analysis": analysis_result
    }

from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Meeting


class ChatQuery(BaseModel):
    question: str


@router.post("/global-query")
async def global_search(query: ChatQuery, db: Session = Depends(get_db)):
    # 1. Fetch all processed meetings from the database
    meetings = db.query(Meeting).all()
    
    if not meetings:
        return {"answer": "No meetings found in the database to search through."}

    # 2. Combine all transcript texts into one big context
    combined_context = ""
    for meeting in meetings:
        path = os.path.join(UPLOAD_DIR, meeting.filename)
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                combined_context += f"\n--- Meeting: {meeting.filename} ---\n"
                combined_context += f.read()

    # 3. Ask Gemini to find the answer across all files
    prompt = f"""
    You are an AI Executive Assistant. You have access to multiple meeting transcripts.
    Answer the user's question by looking across ALL the provided transcripts.
    Mention which specific meeting you are referring to in your answer.
    
    User Question: {query.question}
    
    All Meeting Data:
    {combined_context}
    """

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )

    return {"answer": response.text}