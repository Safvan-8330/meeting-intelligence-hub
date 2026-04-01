import React, { useState, useEffect } from 'react';
import { Activity, User, MessageSquareWarning, ThumbsUp, Minus, BarChart3, LayoutDashboard } from 'lucide-react';

export default function SentimentDashboard({ filename }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'analytics'

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/sentiment/${filename}`);
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

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse border border-slate-800 rounded-3xl mt-8">Analyzing room vibe...</div>;
  if (!data || !data.speakers) return null;

  // Derive some high-level analytics for the Dashboard view
  const avgScore = (data.speakers.reduce((acc, curr) => acc + curr.score, 0) / data.speakers.length).toFixed(1);
  const mostPositive = data.speakers.reduce((prev, current) => (prev.score > current.score) ? prev : current);
  const mostNegative = data.speakers.reduce((prev, current) => (prev.score < current.score) ? prev : current);

  const getScoreColor = (score) => {
    if (score >= 8) return 'bg-emerald-500 text-emerald-100 border-emerald-500/50';
    if (score >= 5) return 'bg-blue-500 text-blue-100 border-blue-500/50';
    return 'bg-red-500 text-red-100 border-red-500/50';
  };

  const getTextColor = (score) => {
    if (score >= 8) return 'text-emerald-400';
    if (score >= 5) return 'text-blue-400';
    return 'text-red-400';
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
        <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" /> Summary Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <BarChart3 className="w-4 h-4 mr-2" /> Deep Analytics
          </button>
        </div>
      </div>

      {/* VIEW 1: SUMMARY DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            
            {/* Big Vibe Card */}
            <div className="col-span-1 md:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-center">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Overall Room Vibe</p>
              <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                "{data.overall_vibe}"
              </h3>
            </div>

            {/* Health Score Card */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Meeting Health</p>
              <h3 className={`text-4xl font-extrabold ${getTextColor(avgScore)}`}>{avgScore} <span className="text-lg text-slate-600">/ 10</span></h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
               <p className="text-xs text-emerald-500 font-bold uppercase mb-1">Highest Morale</p>
               <p className="text-slate-200 font-semibold">{mostPositive.name} <span className="text-slate-500 text-sm font-normal">({mostPositive.emotion})</span></p>
             </div>
             <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
               <p className="text-xs text-red-500 font-bold uppercase mb-1">Most Concerned</p>
               <p className="text-slate-200 font-semibold">{mostNegative.name} <span className="text-slate-500 text-sm font-normal">({mostNegative.emotion})</span></p>
             </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DEEP ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
          {data.speakers.map((speaker, idx) => (
            <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-slate-800/60 flex flex-col">
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
              
              {/* Visual Bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden flex">
                <div 
                  className={`h-full ${getScoreColor(speaker.score).split(' ')[0]}`} 
                  style={{ width: `${speaker.score * 10}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}