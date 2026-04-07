from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import os, io, csv, textwrap, json
from datetime import datetime
from fpdf import FPDF
from app.database import supabase
from pydantic import BaseModel
from app.services.extractor import extract_full_intelligence

# Resolve uploads directory relative to the backend root so routes work
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')

router = APIRouter()


def safe_split_text(text, width=85):
    if not text:
        return []
    clean = str(text).encode('ascii', 'ignore').decode('ascii')
    return textwrap.wrap(clean, width=width)


@router.get("/full-report/{filename}")
async def get_full_report(filename: str):
    # Fetch all data from cloud tables
    res = supabase.table("meetings").select("id").eq("filename", filename).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Meeting not found")
    m_id = res.data[0]['id']

    decisions = supabase.table("decisions").select("text").eq("meeting_id", m_id).execute()
    actions = supabase.table("action_items").select("*").eq("meeting_id", m_id).execute()
    sentiments = supabase.table("sentiments").select("*").eq("meeting_id", m_id).execute()
    users = supabase.table("meeting_users").select("user_name").eq("meeting_id", m_id).execute()
    trans_res = supabase.table("transcripts").select("raw_text").eq("meeting_id", m_id).execute()

    transcript = ""
    if trans_res and getattr(trans_res, 'data', None):
        if isinstance(trans_res.data, list):
            parts = [r.get('raw_text', '') for r in trans_res.data if r.get('raw_text')]
            transcript = "\n\n".join(parts)
        elif isinstance(trans_res.data, dict):
            transcript = trans_res.data.get('raw_text', '')

    decisions_list = decisions.data or []
    actions_list = actions.data or []
    sentiments_list = sentiments.data or []
    users_list = users.data or []

    return {
        "filename": filename,
        "transcript": transcript,
        "decisions": [d.get('text') for d in decisions_list],
        "action_items": actions_list,
        "participants": [u.get('user_name') for u in users_list],
        "speaker_sentiment": [s for s in sentiments_list if s.get('type') == 'speaker'],
        "segment_sentiment": [s for s in sentiments_list if s.get('type') == 'segment']
    }


@router.get("/export/csv/{filename}")
async def export_csv(filename: str):
    cache_path = os.path.join(UPLOAD_DIR, f"{filename}_analysis.json")
    if not os.path.exists(cache_path):
        raise HTTPException(status_code=404, detail="Analysis cache not found.")
        
    with open(cache_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # --- AUTO-REPAIR: Extract missing data from the uploaded TXT file ---
    if not data.get('participants') or not data.get('speaker_sentiment'):
        txt_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(txt_path):
            ai_data, _ = extract_full_intelligence(txt_path)
            if ai_data:
                data['participants'] = ai_data.get('users', [])
                data['speaker_sentiment'] = ai_data.get('speaker_sentiment', [])
                # Update cache so it's instant next time
                with open(cache_path, 'w', encoding='utf-8') as cache_file:
                    json.dump(data, cache_file, ensure_ascii=False, indent=2)

    # Build a flat CSV with the requested columns
    meeting_name = filename
    decisions = data.get('decisions', [])
    action_items = data.get('action_items', [])
    speaker_sentiment = data.get('speaker_sentiment', [])

    # Map speaker sentiment by lowercase name -> score/label
    sentiment_map = {}
    for s in speaker_sentiment:
        name = (s.get('label') or s.get('name') or '').strip()
        if name:
            sentiment_map[name.lower()] = s.get('score')

    output = io.StringIO()
    # quoting=csv.QUOTE_ALL to fix long text formatting in Excel
    writer = csv.writer(output, quoting=csv.QUOTE_ALL)

    # Header
    writer.writerow(["Meeting_Name", "Type", "Assignee", "Description", "Due_Date", "Speaker_Sentiment"])

    # Decisions as rows
    for d in decisions:
        writer.writerow([meeting_name, "Decision", "", d or "", "", ""])

    # Action items as rows
    for a in action_items:
        assignee = (a.get('assignee') or a.get('who') or '').strip()
        desc = (a.get('task') or a.get('what') or '').strip()
        due = (a.get('due_date') or a.get('by_when') or '')
        sentiment_score = ''
        if assignee:
            score = sentiment_map.get(assignee.lower())
            if score is not None:
                # Translate numeric score to label
                if score >= 0.2:
                    sentiment_score = 'Positive'
                elif score <= -0.2:
                    sentiment_score = 'Negative'
                else:
                    sentiment_score = 'Neutral'

        writer.writerow([meeting_name, "Action Item", assignee, desc, due or "", sentiment_score])

    output.seek(0)
    csv_text = output.getvalue()
    # Prepend UTF-8 BOM so Excel on Windows recognizes UTF-8 correctly
    bom_prefixed = '\ufeff' + csv_text
    csv_bytes = bom_prefixed.encode('utf-8')
    headers = {
        'Content-Disposition': f'attachment; filename="{filename}.csv"'
    }
    return StreamingResponse(io.BytesIO(csv_bytes), media_type='text/csv', headers=headers)


@router.get("/export/pdf/{filename}")
async def export_pdf(filename: str):
    cache_path = os.path.join(UPLOAD_DIR, f"{filename}_analysis.json")
    if not os.path.exists(cache_path):
        raise HTTPException(status_code=404, detail="Analysis cache not found.")
        
    with open(cache_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # --- AUTO-REPAIR: Extract missing data from the uploaded TXT file ---
    if not data.get('participants') or not data.get('speaker_sentiment'):
        txt_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(txt_path):
            ai_data, _ = extract_full_intelligence(txt_path)
            if ai_data:
                data['participants'] = ai_data.get('users', [])
                data['speaker_sentiment'] = ai_data.get('speaker_sentiment', [])
                # Update cache so it's instant next time
                with open(cache_path, 'w', encoding='utf-8') as cache_file:
                    json.dump(data, cache_file, ensure_ascii=False, indent=2)

    # Prepare metadata
    decisions = data.get('decisions', [])
    action_items = data.get('action_items', [])
    participants = data.get('participants', [])
    speaker_sentiment = data.get('speaker_sentiment', [])

    # Compute vibe summary from speaker_sentiment
    avg_score = None
    scores = [s.get('score') for s in speaker_sentiment if isinstance(s.get('score'), (int, float))]
    if scores:
        avg_score = sum(scores) / len(scores)
    if avg_score is None:
        vibe = 'No sentiment data'
    elif avg_score >= 0.2:
        vibe = 'Overall Sentiment: Positive'
    elif avg_score <= -0.2:
        vibe = 'Overall Sentiment: Negative'
    else:
        vibe = 'Overall Sentiment: Neutral'

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Header / Metadata
    pdf.set_font("Helvetica", style="B", size=16)
    pdf.cell(0, 10, f"{filename}", ln=True, align="L")
    pdf.set_font("Helvetica", size=10)
    pdf.cell(0, 6, f"Processed: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", ln=True)
    pdf.ln(4)
    
    # Participants
    pdf.set_font("Helvetica", style="B", size=11)
    pdf.cell(0, 6, "Participants:", ln=True)
    pdf.set_font("Helvetica", size=10)
    if participants:
        pdf.multi_cell(0, 6, ", ".join(participants))
    else:
        pdf.cell(0, 6, "(none)", ln=True)

    pdf.ln(6)

    # Vibe / Executive summary
    pdf.set_font("Helvetica", style="B", size=12)
    pdf.cell(0, 8, "Vibe Check", ln=True)
    pdf.set_font("Helvetica", size=11)
    pdf.multi_cell(0, 6, vibe)

    pdf.ln(4)

    # Detailed Speaker Sentiment Breakdown
    pdf.set_font("Helvetica", style="B", size=11)
    pdf.cell(0, 6, "Speaker Sentiment Breakdown:", ln=True)
    pdf.set_font("Helvetica", size=10)
    if speaker_sentiment:
        for s in speaker_sentiment:
            name = s.get('label') or s.get('name') or 'Unknown'
            score = s.get('score')
            if score is None:
                lbl = "Neutral"
            elif score >= 0.2:
                lbl = "Positive"
            elif score <= -0.2:
                lbl = "Negative"
            else:
                lbl = "Neutral"
            
            score_txt = f"{score:.2f}" if isinstance(score, (int, float)) else "N/A"
            for line in safe_split_text(f"* {name} - {lbl} (Score: {score_txt})"):
                pdf.cell(0, 6, line, ln=True)
    else:
        pdf.cell(0, 6, "(none recorded)", ln=True)

    pdf.ln(6)

    # Key Decisions
    pdf.set_font("Helvetica", style="B", size=12)
    pdf.cell(0, 8, "Key Decisions", ln=True)
    pdf.set_font("Helvetica", size=11)
    if decisions:
        for d in decisions:
            for line in safe_split_text(f"- {d}", width=100):
                pdf.cell(0, 6, line, ln=True)
            pdf.ln(1)
    else:
        pdf.cell(0, 6, "No recorded decisions.", ln=True)

    pdf.ln(6)

    # Action Items (Tracker)
    pdf.set_font("Helvetica", style="B", size=12)
    pdf.cell(0, 8, "Action Items", ln=True)
    pdf.set_font("Helvetica", size=11)
    if action_items:
        for a in action_items:
            assignee = a.get('assignee') or a.get('who') or ''
            task = a.get('task') or a.get('what') or ''
            due = a.get('due_date') or a.get('by_when') or ''

            # Bold the assignee
            if assignee:
                pdf.set_font("Helvetica", style="B", size=11)
                pdf.cell(0, 6, f"{assignee}", ln=True)
                pdf.set_font("Helvetica", size=11)
                pdf.multi_cell(0, 6, f"- {task} (Due: {due or 'TBD'})")
            else:
                pdf.multi_cell(0, 6, f"- {task} (Due: {due or 'TBD'})")
            pdf.ln(2)
    else:
        pdf.cell(0, 6, "No action items.", ln=True)

    # Return PDF bytes
    return StreamingResponse(io.BytesIO(pdf.output()), media_type="application/pdf")


@router.get("/{filename}")
async def get_analysis(filename: str):
    """Return cached analysis JSON if available, otherwise build from cloud data or transcript file."""
    file_path = os.path.join(UPLOAD_DIR, filename)
    cache_path = os.path.join(UPLOAD_DIR, f"{filename}_analysis.json")

    # 1) If cached analysis exists, return it
    if os.path.exists(cache_path):
        with open(cache_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return {"analysis": data}

    # 2) Try building from Supabase tables
    try:
        data = await get_full_report(filename)
        analysis = {
            "transcript": data.get("transcript", ""),
            "decisions": data.get("decisions", []),
            "action_items": data.get("action_items", []),
            "participants": data.get("participants", []),
            "speaker_sentiment": data.get("speaker_sentiment", []),
            "segment_sentiment": data.get("segment_sentiment", []),
        }
        return {"analysis": analysis}
    except HTTPException:
        # 3) Fallback: if a raw transcript file exists locally, return minimal analysis
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                txt = f.read()
            return {"analysis": {"transcript": txt, "decisions": [], "action_items": [], "participants": []}}
        raise


@router.post('/sync/{filename}')
async def sync_analysis(filename: str):
    """Run AI analysis for `filename`, save a cached analysis file, and sync results
    into Supabase tables. This endpoint is idempotent: it clears existing rows for the
    meeting and replaces them with the latest analysis.
    """
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail='Transcript file not found')

    # Ensure meeting row exists
    try:
        supabase.table('meetings').upsert({'filename': filename}, on_conflict='filename').execute()
    except Exception as e:
        print(f"⚠️ Could not upsert meeting: {e}")

    # Fetch meeting id
    res = supabase.table('meetings').select('id').eq('filename', filename).execute()
    if not res or not getattr(res, 'data', None):
        raise HTTPException(status_code=500, detail='Failed to resolve meeting id')
    m_id = res.data[0]['id']

    # Run the AI extractor
    ai_data, raw_text = extract_full_intelligence(file_path)
    if not ai_data:
        raise HTTPException(status_code=503, detail='AI analysis failed; try again later')

    # Build canonical analysis object and cache to file
    analysis = {
        'transcript': raw_text,
        'decisions': ai_data.get('decisions', []),
        'action_items': ai_data.get('action_items', []),
        'participants': ai_data.get('users', []),
        'speaker_sentiment': ai_data.get('speaker_sentiment', []),
        'segment_sentiment': ai_data.get('segment_sentiment', [])
    }
    cache_path = os.path.join(UPLOAD_DIR, f"{filename}_analysis.json")
    try:
        with open(cache_path, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"⚠️ Failed to write analysis cache: {e}")

    # Clear existing rows for this meeting to avoid duplicates
    for table in ('decisions', 'action_items', 'sentiments', 'meeting_users'):
        try:
            supabase.table(table).delete().eq('meeting_id', m_id).execute()
        except Exception:
            pass

    # Insert fresh data
    try:
        supabase.table('transcripts').insert({'meeting_id': m_id, 'raw_text': raw_text}).execute()

        if analysis['decisions']:
            dec_list = [{'meeting_id': m_id, 'text': d} for d in analysis['decisions']]
            supabase.table('decisions').insert(dec_list).execute()

        act_items = ai_data.get('action_items', [])
        normalized = []
        for a in act_items:
            who = a.get('who') or a.get('assignee') or a.get('owner') or None
            what = a.get('what') or a.get('task') or a.get('title') or None
            when = a.get('by_when') or a.get('due_date') or a.get('deadline') or None
            normalized.append({'meeting_id': m_id, 'assignee': who, 'task': what, 'due_date': when})
        if normalized:
            supabase.table('action_items').insert(normalized).execute()

        sent_list = []
        for s in ai_data.get('speaker_sentiment', []):
            sent_list.append({'meeting_id': m_id, 'type': 'speaker', 'label': s.get('name'), 'score': s.get('score')})
        for seg in ai_data.get('segment_sentiment', []):
            sent_list.append({'meeting_id': m_id, 'type': 'segment', 'label': seg.get('timestamp'), 'score': seg.get('score')})
        if sent_list:
            supabase.table('sentiments').insert(sent_list).execute()

        users = ai_data.get('users') or analysis.get('participants') or []
        if users:
            user_list = [{'meeting_id': m_id, 'user_name': u} for u in users]
            supabase.table('meeting_users').insert(user_list).execute()

    except Exception as e:
        print(f"❌ Error syncing analysis to Supabase: {e}")
        raise HTTPException(status_code=500, detail='Failed to sync analysis to database')

    return {'result': 'ok', 'analysis': analysis}


class ChatQuery(BaseModel):
    question: str


@router.post("/global-query")
async def global_search(query: ChatQuery):
    res = supabase.table("transcripts").select("raw_text, meetings(filename)").execute()
    context = ""
    for r in (res.data or []):
        # some rows may not have meetings relation
        meeting_fn = r.get('meetings', {}).get('filename') if r.get('meetings') else None
        context += f"\nFile: {meeting_fn or 'unknown'}\n{r.get('raw_text', '')}"

    return {"answer": "Search results based on cloud data"}