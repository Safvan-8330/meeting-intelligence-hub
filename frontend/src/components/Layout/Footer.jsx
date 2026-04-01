import React from 'react';
import { BrainCircuit } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-12 pb-8 mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
              <span className="font-bold text-white tracking-tight">MeetingHub</span>
            </div>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
              The enterprise intelligence engine that turns hours of conversation into instant action items and insights using Gemini AI.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Workspace</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Security</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/about" className="hover:text-indigo-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

        </div>
        
        <div className="pt-8 border-t border-slate-900 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-slate-600 text-xs font-semibold">
          <p>© 2026 Meeting Intelligence Hub. Built with React & FastAPI.</p>
          <div className="mt-4 md:mt-0 flex gap-4">
            <span>Status: All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}