from fastapi import APIRouter, HTTPException
import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter()
UPLOAD_DIR = "uploads"

@router.get("/{filename}")
async def analyze_sentiment(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Transcript not found")
        
    with open(file_path, 'r', encoding='utf-8') as f:
        transcript = f.read()

    prompt = f"""
    Analyze the following meeting transcript and determine the sentiment and 'vibe' of each speaker.
    Return ONLY a valid JSON object with the exact following structure. Do not include markdown formatting or extra text.
    {{
        "overall_vibe": "A brief 3-word summary of the meeting tone",
        "speakers": [
            {{
                "name": "Speaker Name",
                "score": 8, 
                "emotion": "Enthusiastic",
                "reason": "Brief reason why"
            }}
        ]
    }}
    
    Score is 1 to 10. (1 = Highly Negative/Angry, 5 = Neutral, 10 = Highly Positive/Enthusiastic).
    
    Transcript:
    {transcript}
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        
        result_text = response.text.strip()
        if result_text.startswith("```json"):
            result_text = result_text[7:-3].strip()
        elif result_text.startswith("```"):
            result_text = result_text[3:-3].strip()
            
        return json.loads(result_text)
    except Exception as e:
        print(f"Error parsing sentiment: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze sentiment")