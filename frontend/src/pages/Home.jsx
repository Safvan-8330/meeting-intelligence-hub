import React from 'react';
import { Sparkles } from 'lucide-react';
import UploadPortal from '../components/Upload/UploadPortal';
import MeetingHistory from '../components/Dashboard/MeetingHistory'; 
import GlobalSearch from '../components/Dashboard/GlobalSearch';
import LiveRecord from '../components/Upload/LiveRecord'; // <-- 1. Import the new component

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 sm:p-12 selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
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

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Side: Standard File Upload */}
          <div className="lg:col-span-7">
            <UploadPortal />
          </div>

          {/* Right Side: Live Voice Capture & Info */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* --- 2. Added the Live Record Component here --- */}
            <LiveRecord />

            {/* System Workflow Info Panel */}
            <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
              <h2 className="text-xl font-bold text-white mb-6 relative z-10 text-center">How it works</h2>
              <div className="space-y-6 relative z-10">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-sm font-bold mr-4">1</div>
                  <p className="text-sm text-slate-400">Capture audio or upload transcripts.</p>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 text-sm font-bold mr-4">2</div>
                  <p className="text-sm text-slate-400">Gemini extracts decisions & tasks.</p>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-purple-400 text-sm font-bold mr-4">3</div>
                  <p className="text-sm text-slate-400">Export professional PDF reports.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Intelligence Section */}
        <div className="mt-12">
          <GlobalSearch />
        </div>

        {/* Meeting History Section */}
        <MeetingHistory />

      </div>
    </div>
  );
}