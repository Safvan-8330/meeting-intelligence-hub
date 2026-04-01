import React from 'react';
import { Sparkles } from 'lucide-react';
import UploadPortal from '../components/Upload/UploadPortal';
import MeetingHistory from '../components/Dashboard/MeetingHistory'; 
import GlobalSearch from '../components/Dashboard/GlobalSearch';
import LiveRecord from '../components/Upload/LiveRecord';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 sm:p-10 selection:bg-indigo-500/30">
      {/* Increased max-width to match the Dashboard layout */}
      <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-500">
        
        {/* 1. HERO & COMMAND CENTER */}
        <header className="flex flex-col items-center text-center pt-8 md:pt-12 pb-4 relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-6 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Sparkles className="w-4 h-4 mr-2" />
            Enterprise Intelligence
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight mb-6 pb-2">
            Meeting Intelligence Hub
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl font-medium mb-10">
            Securely ingest transcripts, extract critical decisions, and query your entire workspace in real-time.
          </p>

          {/* Moved Global Search front and center! */}
          <div className="w-full max-w-4xl relative z-10 shadow-2xl">
            <GlobalSearch />
          </div>
        </header>

        {/* 2. INGESTION ZONE (Upload & Live Record side-by-side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-full">
            <UploadPortal />
          </div>
          <div className="h-full">
            <LiveRecord />
          </div>
        </div>

        {/* 3. SLEEK HORIZONTAL WORKFLOW BANNER (Replaces the bulky vertical box) */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
          <div className="flex items-center gap-4 w-full md:w-1/3 p-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold shrink-0 shadow-inner">1</div>
            <div>
              <h4 className="text-slate-200 font-bold text-sm">Ingest Data</h4>
              <p className="text-slate-500 text-xs mt-0.5">Upload transcripts or record live</p>
            </div>
          </div>
          
          <div className="hidden md:block w-px h-12 bg-slate-800/80"></div>
          
          <div className="flex items-center gap-4 w-full md:w-1/3 p-2">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0 shadow-inner">2</div>
            <div>
              <h4 className="text-slate-200 font-bold text-sm">Neural Extraction</h4>
              <p className="text-slate-500 text-xs mt-0.5">AI isolates tasks & sentiment</p>
            </div>
          </div>
          
          <div className="hidden md:block w-px h-12 bg-slate-800/80"></div>
          
          <div className="flex items-center gap-4 w-full md:w-1/3 p-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0 shadow-inner">3</div>
            <div>
              <h4 className="text-slate-200 font-bold text-sm">Global Query</h4>
              <p className="text-slate-500 text-xs mt-0.5">Chat with your entire history</p>
            </div>
          </div>
        </div>

        {/* 4. MEETING HISTORY */}
        <div className="pt-4">
          <MeetingHistory />
        </div>

      </div>
    </div>
  );
}