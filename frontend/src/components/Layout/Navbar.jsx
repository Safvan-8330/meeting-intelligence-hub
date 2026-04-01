import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react'; // <-- Removed Github from here!

// Custom SVG to replace the removed Lucide Github icon
const GithubIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" height="20" viewBox="0 0 24 24" 
    fill="none" stroke="currentColor" strokeWidth="2" 
    strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7a5.44 5.44 0 0 0-1.5-3.78 5.07 5.07 0 0 0-.09-3.77s-1.18-.35-3.91 1.48a13.38 13.38 0 0 0-7 0c-2.73-1.83-3.91-1.48-3.91-1.48A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7a3.37 3.37 0 0 0-.94 2.58V22" />
  </svg>
);

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 transition-all">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors border border-indigo-500/20">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="font-bold text-white tracking-tight text-lg">
            Meeting<span className="text-indigo-400">Hub</span>
          </span>
        </Link>

        {/* Center Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={`text-sm font-semibold transition-colors hover:text-indigo-400 ${isActive('/') ? 'text-white' : 'text-slate-400'}`}>
            Workspace
          </Link>
          <Link to="/about" className={`text-sm font-semibold transition-colors hover:text-indigo-400 ${isActive('/about') ? 'text-white' : 'text-slate-400'}`}>
            About Us
          </Link>
          <a href="#" className="text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors">
            Documentation
          </a>
        </div>

        {/* Right Call to Actions */}
        <div className="flex items-center gap-4">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
            {/* Using the custom icon here! */}
            <GithubIcon className="w-5 h-5" />
          </a>
          <button className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition-all border border-slate-700">
            Sign In
          </button>
          <button className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            Get Started
          </button>
        </div>

      </div>
    </nav>
  );
}