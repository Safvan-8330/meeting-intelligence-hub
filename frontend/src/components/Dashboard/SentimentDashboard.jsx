import React, { useState, useEffect } from 'react';
import { Activity, User, MessageSquareWarning, ThumbsUp, Minus, BarChart3, LayoutDashboard, Clock } from 'lucide-react';

export default function SentimentDashboard({ filename }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'analytics', or 'timeline'

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        const response = await fetch(``${import.meta.env.VITE_API_URL}`/api/sentiment/${filename}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch sentiment:", error);
      } finally {
        setLoading(false);
      }
    };

    if (filename) fetchSentiment();
  }, [filename]);

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse border border-slate-800 rounded-3xl mt-8">Analyzing room vibe & timeline...</div>;
  if (!data || !data.speakers) return null;

  const avgScore = (data.speakers.reduce((acc, curr) => acc + curr.score, 0) / data.speakers.length).toFixed(1);
  const mostPositive = data.speakers.reduce((prev, current) => (prev.score > current.score) ? prev : current);
  const mostNegative = data.speakers.reduce((prev, current) => (prev.score < current.score) ? prev : current);

  const getScoreColor = (score) => {
    if (score >= 8) return 'bg-emerald-500 text-emerald-100 border-emerald-500/50';
    if (score >= 5) return 'bg-blue-500 text-blue-100 border-blue-500/50';
    return 'bg-red-500 text-red-100 border-red-500/50';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl mt-8 mb-8">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center">
          <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400 mr-4">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Sentiment Intelligence</h2>
        </div>

        {/* The Toggle Switch */}
        <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" /> Summary
          </button>
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'timeline' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Clock className="w-4 h-4 mr-2" /> Timeline
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <BarChart3 className="w-4 h-4 mr-2" /> Speakers
          </button>
        </div>
      </div>

      {/* VIEW 1: SUMMARY DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          {/* ... existing summary cards ... */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="col-span-1 md:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-center">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Overall Room Vibe</p>
              <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                "{data.overall_vibe}"
              </h3>
            </div>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Meeting Health</p>
              <h3 className="text-4xl font-extrabold text-slate-200">{avgScore} <span className="text-lg text-slate-600">/ 10</span></h3>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: THE TIMELINE (NEW!) */}
      {activeTab === 'timeline' && data.timeline && (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
          <p className="text-slate-400 text-sm mb-6">Chronological breakdown of the meeting's emotional tone.</p>
          
          <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-8">
            {data.timeline.map((item, idx) => (
              <div key={idx} className="relative">
                {/* Timeline Dot */}
                <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-4 border-slate-900 ${getScoreColor(item.score).split(' ')[0]}`}></div>
                
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/60">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-indigo-400 font-bold text-sm tracking-wider uppercase">{item.segment}</span>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getScoreColor(item.score)}`}>
                      Score: {item.score}/10
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm">{item.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: DEEP ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
          {data.speakers.map((speaker, idx) => (
             <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-slate-800/60 flex flex-col">
               {/* ... existing speaker logic ... */}
               <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center text-slate-200 font-bold">
                   <User className="w-4 h-4 mr-2 text-slate-500" />
                   {speaker.name}
                 </div>
                 <div className={`flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(speaker.score)}`}>
                   <span className="ml-1.5">{speaker.score}/10</span>
                 </div>
               </div>
               <div className="mt-auto">
                 <p className="text-sm font-semibold text-slate-300 mb-1">Emotion: {speaker.emotion}</p>
                 <p className="text-xs text-slate-500 leading-relaxed italic">"{speaker.reason}"</p>
               </div>
               <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden flex">
                 <div className={`h-full ${getScoreColor(speaker.score).split(' ')[0]}`} style={{ width: `${speaker.score * 10}%` }}></div>
               </div>
             </div>
          ))}
        </div>
      )}

    </div>
  );
}