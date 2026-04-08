from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import time
import re
from typing import List
from groq import Groq
from dotenv import load_dotenv

# Load the API key and initialize the new client
load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

router = APIRouter()
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')

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
    
    CRITICAL INSTRUCTION: At the very end of your answer, you MUST add a section called "📍 SOURCES:". 
    In this section, list the filename ({query.filename}) and briefly quote the specific sentence or section of the transcript you used to get this answer.
    
    User Question: {query.question}
    
    Meeting Transcript:
    {transcript}
    """

    # Try a few times with exponential backoff for transient AI errors
    max_retries = 3
    backoff_base = 1.5
    last_exc = None

    for attempt in range(1, max_retries + 1):
        try:
            response = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile"
            )
            
            return {
                "answer": response.choices[0].message.content,
                "citation": "AI Analysis of Transcript",
            }
        except Exception as e:
            last_exc = e
            print(f"❌ Chat AI error (attempt {attempt}): {e}")
            if attempt < max_retries:
                sleep_time = backoff_base ** attempt
                time.sleep(sleep_time)

    # If we reach here, AI calls consistently failed. Provide a graceful fallback.
    def _extract_sentences(text: str) -> List[str]:
        # split on sentence boundaries
        return re.split(r'(?<=[.!?])\s+', text.strip())

    def _keywords_from_question(q: str) -> List[str]:
        cleaned = re.sub(r"[^a-zA-Z0-9\s]", " ", q).lower()
        words = [w for w in cleaned.split() if len(w) > 2]
        return words

    sentences = _extract_sentences(transcript)
    keywords = _keywords_from_question(query.question)

    matches: List[str] = []
    if keywords:
        for s in sentences:
            sl = s.lower()
            if any(k in sl for k in keywords):
                matches.append(s)
            if len(matches) >= 3:
                break

    if matches:
        fallback_answer = (
            "AI service is currently unavailable. Here are matching transcript snippets that may help:\n\n"
            + "\n\n".join(matches)
        )
    else:
        # as a last resort, return the first 400 characters of the transcript
        excerpt = transcript[:400]
        fallback_answer = (
            "AI service is currently unavailable and no clear matches were found. "
            "Here is an excerpt from the transcript:\n\n" + excerpt
        )

    # Log the original exception for diagnostics and return 503 so frontend can surface retry UX
    print(f"❌ Chat AI final error after {max_retries} attempts: {last_exc}")
    raise HTTPException(status_code=503, detail={
        "message": "AI service currently unavailable. Fallback provided.",
        "fallback": fallback_answer,
    })