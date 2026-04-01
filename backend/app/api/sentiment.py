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
        print(f"🧠 [SENTIMENT] Sending {filename} to Gemini... please wait.")
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        print(f"✅ [SENTIMENT] Google replied successfully!")
        
        result_text = response.text.strip()
        if result_text.startswith("```json"):
            result_text = result_text[7:-3].strip()
        elif result_text.startswith("```"):
            result_text = result_text[3:-3].strip()
            
        parsed_data = json.loads(result_text)
        
        # 3. SAVE THE CACHE
        with open(cache_path, 'w', encoding='utf-8') as f:
            json.dump(parsed_data, f)
            
        return parsed_data
        
    except Exception as e:
        print(f"❌ Error parsing sentiment (Gemini call failed): {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze sentiment")