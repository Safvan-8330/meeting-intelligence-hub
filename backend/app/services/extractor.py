import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def extract_action_items_and_decisions(file_path: str):
    cache_path = f"{file_path}_analysis.json"
    
    # 1. CHECK CACHE FIRST
    if os.path.exists(cache_path):
        print(f"⚡ [ANALYSIS] Loading lightning-fast cached data for {file_path}")
        with open(cache_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    # 2. If no cache, run the AI
    with open(file_path, 'r', encoding='utf-8') as f:
        transcript = f.read()
    
    prompt = f"""
    Analyze the following meeting transcript and extract the key decisions and action items.
    Return ONLY a valid JSON object with the exact following structure.
    {{
        "decisions": ["decision 1", "decision 2"],
        "action_items": [
            {{"who": "Name", "what": "Task description", "by_when": "Date or timeframe"}}
        ]
    }}
    Transcript:
    {transcript}
    """

    try:
        print(f"📝 [ANALYSIS] Sending {file_path} to Gemini... please wait.")
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        print(f"✅ [ANALYSIS] Google replied successfully!")
        
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
        print(f"❌ Error parsing AI response: {e}")
        return {
            "decisions": ["Error analyzing transcript with AI."],
            "action_items": []
        }