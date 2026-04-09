import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Calendar, FileText, Sparkles, Bot, X, FileSpreadsheet } from 'lucide-react';
import { supabase } from '../lib/supabase'; // 👈 1. IMPORT SUPABASE
import ChatPanel from '../components/Chat/ChatPanel';
import SentimentDashboard from '../components/Dashboard/SentimentDashboard';

export default function MeetingDetail() {
  const { filename } = useParams();
  const [data, setData] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isChatOpen, setIsChatOpen] = useState(true);

  // --- 🔒 SECURED INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Grab the token
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const headers = { 'Authorization': `Bearer ${token}` };

        const [analysisRes, sentimentRes] = await Promise.all([
          // Attach the token to both fetches
          fetch(`${import.meta.env.VITE_API_URL}/api/analysis/${filename}`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/sentiment/${filename}`, { headers })
        ]);

        if (!analysisRes.ok || !sentimentRes.ok) throw new Error('Could not load all meeting data. It may be secured or missing.');

        const analysisResult = await analysisRes.json();
        const sentimentResult = await sentimentRes.json();

        setData(analysisResult.analysis);
        setSentimentData(sentimentResult.sentiment_data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [filename]);

  // --- 🔒 SECURED FILE DOWNLOAD HANDLER ---
  const handleSecureExport = async (type) => {
    try {
      // 1. Grab the token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // 2. Fetch the file data securely
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analysis/export/${type}/${filename}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Export failed or unauthorized");

      // 3. Convert response to a Blob and trigger a fake click to download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename.replace('.txt', '')}_Report.${type === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download the file safely.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-800 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-semibold tracking-wide">Synthesizing insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-red-500/20 max-w-md w-full text-center">
          <p className="text-red-400 font-semibold mb-6">{error}</p>
          <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors border border-slate-700">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 sm:p-10 selection:bg-indigo-500/30 relative">
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Navigation */}
        <Link to="/" className="inline-flex items-center px-4 py-2 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800 hover:border-slate-700 transition-all font-medium text-sm shadow-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Workspace
        </Link>
        
        {/* Premium Dark Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
          <div className="flex items-center relative z-10 w-full">
            <div className="p-4 bg-indigo-500/10 rounded-xl mr-6 border border-indigo-500/20 shadow-inner flex-shrink-0">
              <FileText className="w-8 h-8 text-indigo-400" />
            </div>
            <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-extrabold text-white tracking-tight">{filename}</h1>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase">
                    <Sparkles className="w-3 h-3 mr-1" /> Analyzed
                  </span>
                </div>
                <p className="text-sm text-slate-400 font-medium">Extracted Decisions, Action Items & Sentiment</p>
              </div>
              
              {/* SECURED EXPORT BUTTONS */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleSecureExport('excel')} // 👈 Updated to use secure helper
                  className="inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-xl transition-all border border-slate-700 shadow-sm whitespace-nowrap"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-400" />
                  Excel
                </button>
                <button 
                  onClick={() => handleSecureExport('pdf')} // 👈 Updated to use secure helper
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] whitespace-nowrap"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* MAIN ENTERPRISE GRID */}
        <div className="flex flex-col lg:flex-row gap-8 relative">
          
          {/* LEFT COLUMN: Data Feed */}
          <div className={`transition-all duration-500 ease-in-out flex flex-col gap-8 ${isChatOpen ? 'w-full lg:w-2/3' : 'w-full max-w-5xl mx-auto'}`}>
            
            {/* Key Decisions */}
            <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="p-2 bg-emerald-500/10 rounded-lg mr-3 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                Key Decisions
              </h2>
              <div className="flex-1 space-y-4">
                {data.decisions.map((decision, index) => (
                  <div key={index} className="flex items-start bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 transition-colors hover:bg-slate-800">
                    <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-emerald-500 mr-4 flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <p className="text-slate-300 text-sm leading-relaxed font-medium">{decision}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sentiment Dashboard Wrapper */}
            <div className="rounded-2xl shadow-2xl border border-slate-800 overflow-hidden bg-slate-900 p-2">
              <SentimentDashboard filename={filename} />
            </div>

            {/* Action Items Table */}
            <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="p-2 bg-blue-500/10 rounded-lg mr-3 text-blue-400 border border-blue-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                Action Items Tracker
              </h2>
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 border-b border-slate-700 text-xs uppercase text-slate-400 font-bold tracking-wider">
                      <th className="p-5 w-1/4">Assignee</th>
                      <th className="p-5 w-1/2">Task Description</th>
                      <th className="p-5 w-1/4">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {data.action_items.map((item, index) => (
                      <tr key={index} className="hover:bg-indigo-500/5 transition-colors group">
                        <td className="p-5">
                          <div className="flex items-center font-semibold text-slate-200">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mr-3 text-xs">
                              {(item.who || item.assignee || '?').charAt(0)}
                            </div>
                            {item.who || item.assignee || 'Unassigned'}
                          </div>
                        </td>
                        <td className="p-5 text-slate-400 text-sm font-medium">{item.what || item.task || item.description || 'No description provided'}</td>
                        <td className="p-5">
                          <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 group-hover:bg-slate-700 group-hover:border-indigo-500/30 group-hover:text-indigo-300 transition-colors">
                            <Calendar className="w-3.5 h-3.5 mr-2 opacity-70" />
                            {item.by_when || item.due_date || item.deadline || 'TBD'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Chatbot */}
          {isChatOpen && (
            <div className="w-full lg:w-1/3 animate-in slide-in-from-right-8 duration-500">
              <div className="sticky top-8 h-[calc(100vh-4rem)] flex flex-col">
                <div className="flex-1 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden bg-slate-900 flex flex-col relative">
                  
                  {/* Custom Close Button */}
                  <button 
                    onClick={() => setIsChatOpen(false)}
                    className="absolute top-4 right-4 z-50 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-700 shadow-lg"
                    title="Minimize Assistant"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <ChatPanel filename={filename} />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MINIMIZED FLOATING ROBOT BUTTON */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 z-50 p-4 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-[0_0_25px_rgba(99,102,241,0.5)] text-white transition-all hover:scale-110 animate-in zoom-in group border border-indigo-400/30"
        >
          <Bot className="w-7 h-7" />
          
          <span className="absolute -top-12 right-0 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 shadow-xl pointer-events-none">
            Open AI Assistant
          </span>
        </button>
      )}

    </div>
  );
}