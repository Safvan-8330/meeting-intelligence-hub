from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import upload, analysis, chat, sentiment
from app.database import engine
from app import models

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Meeting Intelligence Hub API")

# UPGRADED CORS POLICY
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # This allows all local ports to connect
    allow_credentials=True,
    allow_methods=["*"], # This allows GET, POST, etc.
    allow_headers=["*"], # This allows all headers
)

app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(sentiment.router, prefix="/api/sentiment", tags=["Sentiment"])

@app.get("/")
def read_root():
    return {"message": "Meeting Intelligence Hub API is running"}