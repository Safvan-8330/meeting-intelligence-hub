import os
import json
from google import genai
from dotenv import load_dotenv

# Load the API key and initialize the new client
load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def extract_action_items_and_decisions(file_path: str):
    # Read the transcript
    with open(file_path, 'r', encoding='utf-8') as f:
        transcript = f.read()
    
    prompt = f"""
    Analyze the following meeting transcript and extract the key decisions and action items.
    Return ONLY a valid JSON object with the exact following structure. Do not include markdown formatting or extra text.
    {{
        "decisions": ["decision 1", "decision 2"],
        "action_items": [
            {{"who": "Name", "what": "Task description", "by_when": "Date or timeframe"}}
        ]
    }}
    
    Transcript:
    {transcript}
    """

    # Use the new SDK syntax and the latest 2.5-flash model
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    
    try:
        result_text = response.text.strip()
        if result_text.startswith("```json"):
            result_text = result_text[7:-3].strip()
        elif result_text.startswith("```"):
            result_text = result_text[3:-3].strip()
            
        return json.loads(result_text)
    except Exception as e:
        print(f"Error parsing AI response: {e}")
        return {
            "decisions": ["Error analyzing transcript with AI."],
            "action_items": []
        }