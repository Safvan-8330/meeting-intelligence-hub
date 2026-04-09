import React, { useState } from 'react';
import { Search, Sparkles, Send, Loader2, X } from 'lucide-react';
import { supabase } from "../../lib/supabase"; 

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);

    try {
      // 2. Grab the Auth Token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analysis/global-query`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 👈 3. Attach the security badge
        },
        // 4. Ensure keys match your Backend (query vs question)
        body: JSON.stringify({ filename: "all", query: query }) 
      });

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      setAnswer(data.answer);
      
    } catch (err) {
      console.error(err);
      setAnswer("Failed to connect to the Global Intelligence engine. Please check your login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-12 bg-slate-900/40 border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(99,102,241,0.05)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-white">Global Intelligence Search</h2>
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything across all your meetings... (e.g. 'Summarize all budget decisions')"
          className="w-full bg-slate-950 border border-slate-800 text-white pl-12 pr-28 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600 shadow-inner"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button 
              type="button" 
              onClick={() => {
                setQuery('');
                setAnswer('');
              }}
              className="p-2 text-slate-500 hover:text-slate-300 transition-colors rounded-lg"
              title="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <button 
            type="submit"
            disabled={loading || !query.trim()}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:shadow-none"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>

      {answer && (
        <div className="mt-6 p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50 animate-in fade-in slide-in-from-top-2">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">AI Synthesis Result</p>
          <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{answer}</p>
        </div>
      )}
    </div>
  );
}