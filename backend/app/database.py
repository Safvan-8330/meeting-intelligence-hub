import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

# Makes deployment safe: It won't crash the server if Render is missing the keys
if url and key:
    supabase: Client = create_client(url, key)
else:
    print("⚠️ WARNING: Supabase credentials not found in environment!")
    supabase = None