import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';
import { supabase } from "../../lib/supabase"; 

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
      {/* max-w-full and pr-0 ensures the right side has no gap */}
      <div className="max-w-full mx-auto pl-6 sm:pl-10 pr-0 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors border border-indigo-500/20">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="font-bold text-white tracking-tight text-lg">
            Meeting<span className="text-indigo-400">Hub</span>
          </span>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-sm font-semibold transition-colors hover:text-indigo-400 ${isActive('/') ? 'text-white' : 'text-slate-400'}`}
          >
            Workspace
          </Link>
          <Link 
            to="/about" 
            className={`text-sm font-semibold transition-colors hover:text-indigo-400 ${isActive('/about') ? 'text-white' : 'text-slate-400'}`}
          >
            About Us
          </Link>
        </div>

        {/* Right Actions - Button shapes restored but hugging the corner */}
        <div className="flex items-center gap-2 pr-2"> 
          {user ? (
            <>
              <button 
                onClick={() => navigate('/profile')} 
                className="hidden sm:inline-flex items-center justify-center px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-all border border-slate-700"
              >
                Profile
              </button>
              <button 
                onClick={handleSignOut} 
                className="inline-flex items-center justify-center px-5 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white text-sm font-bold rounded-xl transition-all border border-red-500/20 hover:border-red-600"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-l-xl transition-all shadow-lg"
            >
              Sign In
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}