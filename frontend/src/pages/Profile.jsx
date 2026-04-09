import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, Mail, ShieldCheck, Zap, ArrowLeft, Camera, Loader2 } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFullName(user.user_metadata?.full_name || user.email.split('@')[0]);
      } else {
        navigate('/login'); // Redirect if not logged in
      }
      setLoading(false);
    }
    getProfile();
  }, [navigate]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      if (error) throw error;
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 3000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 sm:p-10 selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold uppercase tracking-widest">Back to Hub</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar & Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500" />
              
              <div className="relative group cursor-pointer mb-6">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-inner group-hover:border-indigo-500/50 transition-colors">
                  <User className="w-12 h-12 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>
                <div className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 rounded-full border-2 border-slate-900 text-white shadow-lg">
                  <Camera className="w-3 h-3" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-white mb-1">{fullName}</h2>
              <p className="text-sm text-slate-500 font-medium mb-6">{user?.email}</p>
              
              <div className="w-full pt-6 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-tighter">Status</span>
                  <span className="flex items-center text-emerald-400 font-bold">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-tighter">Plan</span>
                  <span className="text-indigo-400 font-bold">Pro Intelligence</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Widget */}
            <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Usage Stats</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-1">
                    <span>AI Minutes Used</span>
                    <span>84%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[84%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings Form */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden h-full">
              <div className="p-8 border-b border-slate-800 bg-slate-800/20">
                <h3 className="text-lg font-bold text-white">Account Settings</h3>
                <p className="text-sm text-slate-500">Manage your profile information and preferences.</p>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Registered Email
                    </label>
                    <input 
                      disabled 
                      value={user?.email || ''} 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <User className="w-3 h-3" /> Full Name
                    </label>
                    <input 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-xl px-4 py-3 text-white text-sm transition-all"
                      placeholder="Your Name"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm">
                    {msg && (
                      <p className={`animate-in fade-in slide-in-from-left-2 font-semibold ${msg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {msg.text}
                      </p>
                    )}
                  </div>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? 'Saving...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}