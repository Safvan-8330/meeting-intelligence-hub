import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Quote } from 'lucide-react';

export default function ChatPanel({ filename }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hi! I've analyzed "${filename}". What would you like to know about this meeting?`, citation: null }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, question: userMessage })
      });

      if (!response.ok) throw new Error('Failed to get answer');
      
      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: data.answer,
        citation: data.citation 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I encountered an error connecting to the intelligence server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-transparent overflow-hidden">
      {/* Dark Header */}
      <div className="bg-slate-900/80 p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center">
          <Bot className="w-5 h-5 text-indigo-400 mr-2" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Contextual Query Engine</h2>
        </div>
        <div className="flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
          Online
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-900/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-sm shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm shadow-md'
            }`}>
              <div className="flex items-center mb-2">
                {msg.role === 'user' ? <User className="w-4 h-4 mr-1.5 opacity-80" /> : <Bot className="w-4 h-4 mr-1.5 text-indigo-400" />}
                <span className="text-xs font-semibold opacity-70">{msg.role === 'user' ? 'You' : 'AI Assistant'}</span>
              </div>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              
              {/* Citation Block */}
              {msg.citation && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <p className="text-xs text-slate-400 flex items-center italic">
                    <Quote className="w-3 h-3 mr-1" />
                    Source: {msg.citation}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm p-4 shadow-md flex space-x-2">
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this meeting..."
            className="flex-1 p-3.5 bg-slate-800 border border-slate-700 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-white placeholder-slate-500"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3.5 rounded-r-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[50px] shadow-[0_0_10px_rgba(79,70,229,0.3)]"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}