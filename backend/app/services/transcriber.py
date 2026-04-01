import speech_recognition as sr
import os

def transcribe_audio_file(audio_path: str):
    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(audio_path) as source:
            audio_data = recognizer.record(source)
            # Using Google's free web speech API for transcription
            text = recognizer.recognize_google(audio_data)
            return text
    except Exception as e:
        print(f"Transcription error: {e}")
        return ""