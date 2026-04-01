import React from 'react';
import { Activity, AlertTriangle, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';

export default function SentimentDashboard({ sentiment }) {
  if (!sentiment) return null;

  // Helper function to pick the right color and icon for the timeline
  const getTimelineStyle = (type) => {
    switch (type) {
      case 'conflict': return { color: 'text-red-600', bg: 'bg-red-100', icon: <AlertTriangle className="w-4 h-4" /> };
      case 'consensus': return { color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'caution': return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: <AlertCircle className="w-4 h-4" /> };
      case 'positive': return { color: 'text-blue-600', bg: 'bg-blue-100', icon: <MessageCircle className="w-4 h-4" /> };
      default: return { color: 'text-gray-600', bg: 'bg-gray-100', icon: <MessageCircle className="w-4 h-4" /> };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <Activity className="w-5 h-5 text-indigo-500 mr-2" />
          Sentiment & Tone Analysis
        </h2>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Overall Vibe</p>
          <p className="text-sm font-bold text-indigo-700">{sentiment.overall_vibe}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        {/* Left Column: Timeline */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-4">Meeting Timeline</h3>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {sentiment.timeline.map((event, idx) => {
              const style = getTimelineStyle(event.type);
              return (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${style.bg} ${style.color}`}>
                    {style.icon}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-900 text-xs">{event.speaker}</span>
                      <span className="text-xs text-gray-500 font-medium">{event.time}</span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">"{event.text}"</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Speaker Breakdown */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-4">Speaker Alignment</h3>
          <div className="space-y-4">
            {sentiment.speakers.map((speaker, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm text-gray-800">{speaker.name}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                    speaker.score > 70 ? 'bg-green-100 text-green-700' :
                    speaker.score < 40 ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {speaker.status}
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      speaker.score > 70 ? 'bg-green-500' :
                      speaker.score < 40 ? 'bg-red-500' :
                      'bg-yellow-500'
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