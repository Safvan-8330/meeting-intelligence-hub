import React from 'react';
import { Sparkles } from 'lucide-react';
import UploadPortal from '../components/Upload/UploadPortal';
import MeetingHistory from '../components/Dashboard/MeetingHistory'; // <-- Import the new component

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 sm:p-12 selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Dark Mode Header */}
        <header className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-4 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Sparkles className="w-4 h-4 mr-2" />
              Advanced AI Engine
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight mb-3">
              Meeting Intelligence Hub
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl font-light">
              Securely ingest transcripts, extract critical decisions, and visualize speaker sentiment in real-time.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <UploadPortal />
          </div>

          {/* Dark "How it works" side panel */}
          <div className="lg:col-span-5 h-full">
            <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-2xl h-full flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
              
              <h2 className="text-xl font-bold text-white mb-8 relative z-10">System Workflow</h2>
              
              <div className="space-y-8 relative z-10">
                <div className="flex">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold mr-4 shadow-inner">1</div>
                  <div>
                    <h3 className="font-semibold text-slate-200">Ingest Data</h3>
                    <p className="text-sm text-slate-500 mt-1">Drag and drop raw .txt or .vtt meeting transcripts.</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold mr-4 shadow-inner">2</div>
                  <div>
                    <h3 className="font-semibold text-slate-200">Neural Extraction</h3>
                    <p className="text-sm text-slate-500 mt-1">The AI isolates action items, dates, and key decisions.</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-purple-400 font-bold mr-4 shadow-inner">3</div>
                  <div>
                    <h3 className="font-semibold text-slate-200">Contextual Query</h3>
                    <p className="text-sm text-slate-500 mt-1">Interact with the data via the natural language assistant.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- ADDED THE HISTORY COMPONENT HERE --- */}
        <MeetingHistory />

      </div>
    </div>
  );
}