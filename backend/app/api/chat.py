from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from google import genai
from dotenv import load_dotenv

# Load the API key and initialize the new client
load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter()
UPLOAD_DIR = "uploads"

class ChatQuery(BaseModel):
    filename: str
    question: str

@router.post("/")
async def ask_question(query: ChatQuery):
    file_path = os.path.join(UPLOAD_DIR, query.filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Transcript not found")
        
    with open(file_path, 'r', encoding='utf-8') as f:
        transcript = f.read()

    prompt = f"""
    You are a highly intelligent meeting assistant. 
    Use the following transcript to answer the user's question. 
    Keep your answer concise, professional, and directly related to the text.
    
    User Question: {query.question}
    
    Meeting Transcript:
    {transcript}
    """

    # Use the new SDK syntax and the latest 2.5-flash model
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )

    return {
        "answer": response.text,
        "citation": "AI Analysis of Transcript"
    }