import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def extract_full_intelligence(file_path: str):
    """Analyzes transcript and returns structured data for Supabase."""
    with open(file_path, 'r', encoding='utf-8') as f:
        transcript_content = f.read()
    
    prompt = f"""
    Analyze this meeting transcript and return a JSON object with:
    1. "decisions": [list of strings]
    2. "action_items": [{{ "who": "name", "what": "task", "by_when": "date" }}]
    3. "speaker_sentiment": [{{ "name": "name", "score": float (-1.0 to 1.0) }}]
    4. "segment_sentiment": [{{ "timestamp": "MM:SS", "score": float (-1.0 to 1.0) }}]
    5. "users": [list of strings of unique participants mentioned or speaking]

    Transcript:
    {transcript_content}
    """

    try:
        print("🧠 [EXTRACTOR] Sending to Groq...")
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        
        result_text = response.choices[0].message.content
        
        # Clean markdown if present
        if result_text.startswith("```json"):
            result_text = result_text[7:-3].strip()
        elif result_text.startswith("```"):
            result_text = result_text[3:-3].strip()
            
        ai_data = json.loads(result_text)
        
        print("✅ [EXTRACTOR] Groq returned data successfully.")
        
        # Safety normalization
        ai_data["decisions"] = ai_data.get("decisions", [])
        ai_data["action_items"] = ai_data.get("action_items", [])
        ai_data["users"] = ai_data.get("users", []) # 👈 Ensure users key exists
        
        return ai_data, transcript_content
        
    except Exception as e:
        print(f"❌ Groq Extraction Error: {e}")
        return None, transcript_content