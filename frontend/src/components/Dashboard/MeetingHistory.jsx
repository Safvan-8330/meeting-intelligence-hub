import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, ChevronRight, History, CheckCircle2 } from 'lucide-react';
import { supabase } from "../../lib/supabase"; // 👈 Ensure this path is correct for your project

export default function MeetingHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      // 1. Grab the session token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // If no token, we can't fetch protected history
      if (!token) {
        setLoading(false);
        return;
      }

      // 2. Attach the token to the GET request
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Backend returns {"history": [...]} based on our previous setup
        setHistory(data.history || data); 
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading || history.length === 0) return null;

  return (
    <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <History className="w-5 h-5 text-indigo-400 mr-2" />
          Recent Analyses
        </h2>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {history.length} {history.length === 1 ? 'Meeting' : 'Meetings'} Found
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((meeting) => (
          <Link 
            key={meeting.id} 
            to={`/meeting/${meeting.filename}`}
            className="group block bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl hover:bg-slate-800/80 hover:border-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/0 group-hover:bg-indigo-500/5 rounded-full blur-2xl transition-all duration-500"></div>
            
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {meeting.status || 'Analyzed'}
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-200 mb-2 truncate group-hover:text-white transition-colors relative z-10">
              {meeting.filename}
            </h3>
            
            <div className="flex gap-2 mt-3 mb-2 relative z-10">
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-wider shadow-inner">
                {meeting.word_count || 0} Words
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                AI Processed
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-4 relative z-10 pt-4 border-t border-slate-800/50">
              <div className="flex items-center text-xs text-slate-500 font-medium">
                <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                {new Date(meeting.upload_date).toLocaleDateString()}
              </div>
              <div className="text-indigo-400 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}