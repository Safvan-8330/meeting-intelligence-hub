import React from 'react';
import { Activity, AlertTriangle, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';

export default function SentimentDashboard({ sentiment }) {
  if (!sentiment) return null;

  const getTimelineStyle = (type) => {
    switch (type) {
      case 'conflict': return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: <AlertTriangle className="w-4 h-4" /> };
      case 'consensus': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'caution': return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <AlertCircle className="w-4 h-4" /> };
      case 'positive': return { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: <MessageCircle className="w-4 h-4" /> };
      default: return { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: <MessageCircle className="w-4 h-4" /> };
    }
  };

  return (
    <div className="bg-transparent p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Activity className="w-5 h-5 text-indigo-400 mr-2" />
          Sentiment & Tone Analysis
        </h2>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Overall Vibe</p>
          <p className="text-sm font-bold text-indigo-400">{sentiment.overall_vibe}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        {/* Left Column: Timeline */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">Meeting Timeline</h3>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
            {sentiment.timeline.map((event, idx) => {
              const style = getTimelineStyle(event.type);
              return (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${style.bg} ${style.color}`}>
                    {style.icon}
                  </div>
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800/50 p-4 rounded-xl border ${style.border} shadow-sm backdrop-blur-sm`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-200 text-xs">{event.speaker}</span>
                      <span className="text-xs text-slate-500 font-medium">{event.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">"{event.text}"</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Speaker Breakdown */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">Speaker Alignment</h3>
          <div className="space-y-5">
            {sentiment.speakers.map((speaker, idx) => (
              <div key={idx} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-sm text-slate-200">{speaker.name}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md border ${
                    speaker.score > 70 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    speaker.score < 40 ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {speaker.status}
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-2 shadow-inner">
                  <div 
                    className={`h-2 rounded-full shadow-[0_0_10px_currentColor] ${
                      speaker.score > 70 ? 'bg-emerald-500 text-emerald-500' :
                      speaker.score < 40 ? 'bg-red-500 text-red-500' :
                      'bg-amber-500 text-amber-500'
                    }`}
                    style={{ width: `${speaker.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}