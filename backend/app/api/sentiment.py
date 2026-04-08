from fastapi import APIRouter, HTTPException
import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

router = APIRouter()
# Resolve uploads directory relative to the backend root so routes work
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')

@router.get("/{filename}")
def analyze_sentiment(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    cache_path = os.path.join(UPLOAD_DIR, f"{filename}_sentiment.json")
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Transcript not found")
        
    # 1. CHECK CACHE FIRST
    if os.path.exists(cache_path):
        print(f"⚡ [SENTIMENT] Loading lightning-fast cached data for {filename}")
        with open(cache_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    # 2. If no cache, run the AI
    with open(file_path, 'r', encoding='utf-8') as f:
        transcript = f.read()

    prompt = f"""
    Analyze the following meeting transcript and determine the sentiment and 'vibe' of each speaker, as well as a chronological timeline of the meeting's mood.
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
        ],
        "timeline": [
            {{
                "segment": "Beginning",
                "score": 6,
                "summary": "Setting the agenda and casual chat"
            }},
            {{
                "segment": "Middle",
                "score": 4,
                "summary": "Heated debate over the budget"
            }},
            {{
                "segment": "End",
                "score": 8,
                "summary": "Resolution and clear action items"
            }}
        ]
    }}
    
    Score is 1 to 10. (1 = Highly Negative/Angry, 5 = Neutral, 10 = Highly Positive/Enthusiastic).
    Create 3 to 5 chronological segments for the timeline based on the flow of the conversation.
    
    Transcript:
    {transcript}
    """

    try:
        print(f"🧠 [SENTIMENT] Sending {filename} to Groq... please wait.")
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        print(f"✅ [SENTIMENT] Groq replied successfully!")

        result_text = response.choices[0].message.content
        parsed_data = json.loads(result_text)
        
        # 3. SAVE THE CACHE
        with open(cache_path, 'w', encoding='utf-8') as f:
            json.dump(parsed_data, f)
            
        return parsed_data
        
    except Exception as e:
        print(f"❌ Error parsing sentiment (Groq call failed): {e}")
        raise HTTPException(status_code=503, detail="AI service unavailable. Try again later.")