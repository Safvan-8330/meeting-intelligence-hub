from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import upload, analysis, chat, sentiment

app = FastAPI(title="Meeting Intelligence Hub")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api/upload")
app.include_router(analysis.router, prefix="/api/analysis")
app.include_router(chat.router, prefix="/api/chat")
app.include_router(sentiment.router, prefix="/api/sentiment")

@app.get("/")
def health_check():
    return {"status": "online"}