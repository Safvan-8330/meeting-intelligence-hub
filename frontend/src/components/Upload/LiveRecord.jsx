import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LiveRecord() {
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const navigate = useNavigate();

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    chunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      setLoading(true);
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');

      try {
        const res = await fetch('`${import.meta.env.VITE_API_URL}`/api/upload/live-voice', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        navigate(`/meeting/${data.filename}`);
      } catch (err) {
        alert("Failed to process voice session.");
      } finally {
        setLoading(false);
      }
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center">
      <div className={`p-6 rounded-full mb-6 transition-all duration-500 ${isRecording ? 'bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.4)] scale-110' : 'bg-slate-800'}`}>
        <Mic className={`w-10 h-10 ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">Live Session</h3>
      <p className="text-slate-500 text-sm mb-8 text-center">Speak directly into the hub for real-time intelligence.</p>

      {isRecording ? (
        <button 
          onClick={stopRecording}
          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center transition-all"
        >
          <Square className="w-4 h-4 mr-2 fill-current" /> Stop & Process
        </button>
      ) : (
        <button 
          onClick={startRecording}
          disabled={loading}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Radio className="w-4 h-4 mr-2" />}
          {loading ? "Processing Voice..." : "Start Live Meeting"}
        </button>
      )}
    </div>
  );
}