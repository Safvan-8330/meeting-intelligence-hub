from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import upload, analysis  # <-- Added analysis here

app = FastAPI(title="Meeting Intelligence Hub API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"]) # <-- Added this line

@app.get("/")
def read_root():
    return {"message": "Meeting Intelligence Hub API is running"}