from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import os, shutil, uuid
from app.database import supabase
from app.services.extractor import extract_full_intelligence
from app.services.transcriber import transcribe_audio_file

router = APIRouter()
# Resolve uploads directory relative to the backend root so file saves/reads work
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')

@router.post("/")
async def upload_transcripts(files: List[UploadFile] = File(...)):
    for file in files:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 1. Register meeting in Cloud (BigInt ID)
        res = supabase.table("meetings").upsert({"filename": file.filename}, on_conflict="filename").execute()

        # Fetch meeting id (ensure we have m_id regardless of AI result)
        m_row = supabase.table("meetings").select("id").eq("filename", file.filename).single().execute()
        m_id = m_row.data.get("id") if m_row and m_row.data else None
        if not m_id:
            # If we couldn't get an id, skip this file
            continue

        # 2. Get AI Intelligence
        ai_data, raw_text = extract_full_intelligence(file_path)

        # 3. SYNC TO SUPABASE TABLES (Removing JSON cache logic)
        # Transcript (always insert raw transcript even if AI failed)
        supabase.table("transcripts").insert({"meeting_id": m_id, "raw_text": raw_text}).execute()

        if not ai_data:
            # AI failed (quota, etc.) — we've recorded the raw transcript; continue without other inserts
            continue

        # Decisions
        if ai_data.get('decisions'):
            dec_list = [{"meeting_id": m_id, "text": d} for d in ai_data['decisions']]
            supabase.table("decisions").insert(dec_list).execute()

        # Action Items
        if ai_data.get('action_items'):
            act_list = [{
                "meeting_id": m_id, "assignee": a['who'], 
                "task": a['what'], "due_date": a['by_when']
            } for a in ai_data['action_items']]
            supabase.table("action_items").insert(act_list).execute()

        # Sentiments (Speaker & Timeline)
        sent_list = []
        for s in ai_data.get('speaker_sentiment', []):
            sent_list.append({"meeting_id": m_id, "type": "speaker", "label": s['name'], "score": s['score']})
        for seg in ai_data.get('segment_sentiment', []):
            sent_list.append({"meeting_id": m_id, "type": "segment", "label": seg['timestamp'], "score": seg['score']})
        if sent_list:
            supabase.table("sentiments").insert(sent_list).execute()

        # Participants/Users
        if ai_data.get('users'):
            user_list = [{"meeting_id": m_id, "user_name": u} for u in ai_data['users']]
            supabase.table("meeting_users").insert(user_list).execute()

    return {"message": "Meeting successfully synced to cloud tables."}

@router.get("/history")
def get_meeting_history():
    # Use Supabase 'count' feature to show action item numbers in dashboard
    response = supabase.table("meetings").select("*, action_items(count)").order("created_at", desc=True).execute()
    return response.data

@router.post("/live-voice")
async def handle_live_voice(file: UploadFile = File(...)):
    temp_path = os.path.join(UPLOAD_DIR, f"live_{uuid.uuid4()}.wav")
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    text = transcribe_audio_file(temp_path)
    if not text: raise HTTPException(status_code=400, detail="Audio failed")

    # Save Voice as TXT and log to Cloud
    fname = f"Voice_{uuid.uuid4().hex[:5]}.txt"
    with open(os.path.join(UPLOAD_DIR, fname), "w") as f: f.write(text)
    
    supabase.table("meetings").insert({"filename": fname}).execute()
    return {"filename": fname, "text": text}