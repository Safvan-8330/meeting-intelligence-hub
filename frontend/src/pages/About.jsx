import React from 'react';
import { Server, Cpu, Layers } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 sm:p-10 selection:bg-indigo-500/30">
      <div className="max-w-[1000px] mx-auto space-y-16 animate-in fade-in duration-700 py-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            The Intelligence Engine
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            MeetingHub was built to solve a simple problem: we spend too much time in meetings, and not enough time executing the ideas generated within them.
          </p>
        </div>

        {/* The Tech Stack Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white text-center">Powered by Modern Architecture</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Frontend */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col items-center text-center hover:border-indigo-500/30 transition-colors">
              <div className="p-4 bg-blue-500/10 rounded-full mb-4 text-blue-400">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">React & Tailwind</h3>
              <p className="text-sm text-slate-400">A blazing fast, highly responsive frontend built with modern React hooks and utility-first CSS for a seamless enterprise UX.</p>
            </div>

            {/* Backend */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col items-center text-center hover:border-emerald-500/30 transition-colors">
              <div className="p-4 bg-emerald-500/10 rounded-full mb-4 text-emerald-400">
                <Server className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">FastAPI Python</h3>
              <p className="text-sm text-slate-400">A robust, asynchronous Python backend handling secure file ingestion, audio processing, and SQLite relational memory.</p>
            </div>

            {/* AI Engine */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col items-center text-center hover:border-purple-500/30 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full"></div>
              <div className="p-4 bg-purple-500/10 rounded-full mb-4 text-purple-400 relative z-10">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 relative z-10">Gemini 2.5 Flash</h3>
              <p className="text-sm text-slate-400 relative z-10">State-of-the-art LLM prompt engineering to extract sentiment timelines, key decisions, and power the global query engine.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}