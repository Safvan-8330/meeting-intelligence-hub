from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List
import os, shutil, uuid
from app.database import supabase
from app.services.extractor import extract_full_intelligence
from app.services.transcriber import transcribe_audio_file
from app.auth import verify_user 

router = APIRouter()

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')

@router.post("/")
async def upload_files(files: list[UploadFile], user_id: str = Depends(verify_user)):
    for file in files:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 1. UPSERT Meeting (Duplicate Fix)
        supabase.table("meetings").upsert({
            "filename": file.filename,
            "user_id": user_id,
            "status": "Processing"
        }, on_conflict="user_id, filename").execute()

        # Get Meeting ID
        m_row = supabase.table("meetings").select("id").eq("user_id", user_id).eq("filename", file.filename).single().execute()
        m_id = m_row.data.get("id") if m_row and m_row.data else None
        
        if not m_id: continue

        # 2. CLEAN UP OLD DATA (For re-uploads)
        supabase.table("transcripts").delete().eq("meeting_id", m_id).execute()
        supabase.table("decisions").delete().eq("meeting_id", m_id).execute()
        supabase.table("action_items").delete().eq("meeting_id", m_id).execute()
        supabase.table("sentiments").delete().eq("meeting_id", m_id).execute()
        supabase.table("meeting_users").delete().eq("meeting_id", m_id).execute() # 👈 Clear old users

        # 3. AI ANALYSIS
        ai_data, raw_text = extract_full_intelligence(file_path)

        # Save Transcript
        supabase.table("transcripts").insert({"meeting_id": m_id, "raw_text": raw_text}).execute()

        if ai_data:
            # Sync Decisions
            if ai_data.get('decisions'):
                dec_list = [{"meeting_id": m_id, "text": d} for d in ai_data['decisions']]
                supabase.table("decisions").insert(dec_list).execute()

            # Sync Action Items
            if ai_data.get('action_items'):
                act_list = [{
                    "meeting_id": m_id, "assignee": a['who'], 
                    "task": a['what'], "due_date": a['by_when']
                } for a in ai_data['action_items']]
                supabase.table("action_items").insert(act_list).execute()

            # Sync Sentiments
            sent_list = []
            for s in ai_data.get('speaker_sentiment', []):
                sent_list.append({"meeting_id": m_id, "type": "speaker", "label": s['name'], "score": s['score']})
            for seg in ai_data.get('segment_sentiment', []):
                sent_list.append({"meeting_id": m_id, "type": "segment", "label": seg['timestamp'], "score": seg['score']})
            if sent_list:
                supabase.table("sentiments").insert(sent_list).execute()

            # --- 🔥 SYNC PARTICIPANTS (MEETING USERS) ---
            participants = ai_data.get('users', [])
            if participants:
                print(f"👥 Syncing {len(participants)} participants for {file.filename}")
                user_list = [{"meeting_id": m_id, "user_name": name} for name in participants]
                supabase.table("meeting_users").insert(user_list).execute()

            # Finalize Status
            supabase.table("meetings").update({"status": "Analyzed"}).eq("id", m_id).execute()

    return {"message": "Meeting successfully processed and synced."}

# History and Live-Voice remain the same as your provided code
@router.get("/history")
def get_meeting_history(user_id: str = Depends(verify_user)):
    response = supabase.table("meetings").select("*, action_items(count)").eq("user_id", user_id).order("created_at", desc=True).execute()
    return response.data

@router.post("/live-voice")
async def handle_live_voice(file: UploadFile = File(...), user_id: str = Depends(verify_user)):
    temp_path = os.path.join(UPLOAD_DIR, f"live_{uuid.uuid4()}.wav")
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    text = transcribe_audio_file(temp_path)
    if not text: raise HTTPException(status_code=400, detail="Audio failed")
    fname = f"Voice_{uuid.uuid4().hex[:5]}.txt"
    with open(os.path.join(UPLOAD_DIR, fname), "w") as f: f.write(text)
    supabase.table("meetings").insert({"filename": fname, "user_id": user_id}).execute()
    return {"filename": fname, "text": text}