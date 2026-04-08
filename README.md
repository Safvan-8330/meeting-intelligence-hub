# meeting-intelligence-hub

## The Problem
Teams lose valuable time parsing through lengthy meeting transcripts to find key takeaways, track action items, and gauge team alignment. Important decisions get buried in the noise, and manually compiling post-meeting reports or analyzing team sentiment is a tedious, error-prone process that slows down execution.

## The Solution
The Meeting Intelligence Hub is an AI-powered full-stack application that transforms raw meeting transcripts and live audio into structured, actionable intelligence. Powered by Google's Gemini 2.0 Flash model, the system automatically extracts key decisions, assigns action items, identifies participants, and performs deep sentiment analysis on both individual speakers and the meeting timeline. Users can explore this data through an interactive dashboard, export professional PDF/CSV reports, and use a "Global Query" AI chat to instantly search across their entire history of company meetings.

## Tech Stack
* **Frontend Framework:** React.js, Vite
* **Styling & UI:** Tailwind CSS, Lucide React Icons
* **Backend Framework:** Python, FastAPI, Uvicorn
* **Database & Cloud Storage:** Supabase (PostgreSQL)
* **AI & Machine Learning:** Google Gemini API (`gemini-2.0-flash`)
* **Document Generation:** `fpdf2` (PDFs), Python `csv` module
* **System Utilities:** FFmpeg (for live browser audio-to-WAV conversion)

## Setup Instructions

### Prerequisites
Before you begin, ensure you have the following installed on your machine:
* **Node.js** (v16 or higher)
* **Python** (v3.8 or higher)
* A **Supabase** account with a configured database project
* A **Google Gemini API** key
