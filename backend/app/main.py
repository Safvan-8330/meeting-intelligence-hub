import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import upload, analysis, chat, sentiment

app = FastAPI(title="Meeting Intelligence Hub")

# --- 🌐 PROFESSIONAL CORS CONFIGURATION ---
# This allows your frontend to talk to the backend from both environments
origins = [
    "http://localhost:5173",                     # Local Development
    "http://localhost:3000",                     # Alternative Local Port
    "https://your-project-name.vercel.app",      # 👈 REPLACE with your actual Vercel URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,                       # Restricted to your trusted domains
    allow_credentials=True,                      # Changed to True to support secure cookies/auth if needed
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 📁 RENDER FILE SYSTEM WORKAROUND ---
# Render uses an ephemeral filesystem. We use /tmp or a relative uploads folder.
# This ensures the directory exists so the AI services don't crash.
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, '..', 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- 🚀 ROUTER REGISTRATION ---
app.include_router(upload.router, prefix="/api/upload")
app.include_router(analysis.router, prefix="/api/analysis")
app.include_router(chat.router, prefix="/api/chat")
app.include_router(sentiment.router, prefix="/api/sentiment")

@app.get("/")
def health_check():
    """Used by Render to verify the service is live."""
    return {
        "status": "online",
        "message": "Meeting Intelligence Hub API is running",
        "environment": os.getenv("RENDER", "local")
    }

# --- 🛠️ RENDER PORT BINDING ---
if __name__ == "__main__":
    import uvicorn
    # Render provides a $PORT environment variable automatically
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)