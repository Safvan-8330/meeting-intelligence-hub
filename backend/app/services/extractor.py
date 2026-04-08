import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def extract_full_intelligence(file_path: str):
    """Analyzes transcript and returns structured data for Supabase."""
    with open(file_path, 'r', encoding='utf-8') as f:
        transcript_content = f.read()
    
    # We ask Gemini for everything in one structured JSON
    prompt = f"""
    Analyze this meeting transcript and return a JSON object with:
    1. "decisions": [list of strings]
    2. "action_items": [{{ "who": "name", "what": "task", "by_when": "date" }}]
    3. "speaker_sentiment": [{{ "name": "name", "score": float (-1.0 to 1.0) }}]
    4. "segment_sentiment": [{{ "timestamp": "MM:SS", "score": float (-1.0 to 1.0) }}]
    5. "users": [list of strings of unique participants]

    Transcript:
    {transcript_content}
    """

    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt,
            config={'response_mime_type': 'application/json'}
        )
        # Parse the JSON response directly
        ai_data = json.loads(response.text)
        return ai_data, transcript_content
    except Exception as e:
        print(f"❌ AI Extraction Error: {e}")
        return None, transcript_content