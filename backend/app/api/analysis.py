from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os

from app.services.reporter import generate_pdf_report
from app.services.extractor import extract_action_items_and_decisions

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/export/{filename}")
async def export_meeting_report(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    # Re-run extraction or pull from cache (we'll run fresh for now)
    analysis_result = extract_action_items_and_decisions(file_path)

    # Generate the PDF
    pdf_path = generate_pdf_report(filename, analysis_result)

    return FileResponse(
        path=pdf_path,
        filename=f"Report_{filename}.pdf",
        media_type='application/pdf'
    )


@router.get("/{filename}")
async def get_analysis(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Transcript not found")

    analysis_result = extract_action_items_and_decisions(file_path)

    return {
        "filename": filename,
        "analysis": analysis_result
    }