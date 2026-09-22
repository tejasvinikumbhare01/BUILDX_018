import React, { useState } from 'react';
import { X, Bot, Send, User, MapPin, Sparkles, AlertCircle, Shield } from 'lucide-react';
import { api } from '../../services/api';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  source?: string;
}

interface ResQAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLat: number | null;
  userLng: number | null;
}

export const ResQAssistantModal: React.FC<ResQAssistantModalProps> = ({
  isOpen,
  onClose,
  userLat,
  userLng,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Hello, I am ResQ AI, your grounded disaster response assistant. I am linked to the active emergency database and live GPS telemetry. How can I assist you right now?',
      source: 'ResQGrid Grounded Knowledge Engine',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: userText,
        latitude: userLat,
        longitude: userLng,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: response.data.reply,
          source: response.data.source,
        },
      ]);
    } catch (err: any) {
      console.error('AI chat request failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Notice: Could not contact emergency assistant engine. Please consult the "Nearby Help" or "Shelters" tabs directly for verified facilities.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'Where is the nearest available shelter?',
    'What should I do during a flood?',
    'Find nearest operational hospital beds',
    'What emergency preparation should I do?',
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel-elevated w-full max-w-xl rounded-3xl p-5 border border-indigo-500/30 shadow-2xl relative flex flex-col h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">ResQ AI Assistant</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Grounded RAG
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected to live PostgreSQL database &amp; your GPS fix
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS telemetry indicator */}
        <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] flex items-center justify-between text-slate-400 mb-3">
          <span className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>GPS Fix:</span>
            {userLat !== null && userLng !== null ? (
              <span className="font-mono text-slate-200 font-bold">
                {userLat.toFixed(4)}, {userLng.toFixed(4)}
              </span>
            ) : (
              <span className="text-amber-400">Not shared</span>
            )}
          </span>
          <span className="flex items-center space-x-1 text-emerald-400 text-[10px]">
            <Shield className="w-3 h-3" />
            <span>No Hallucinated Shelters</span>
          </span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start space-x-2.5 ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl max-w-[82%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                {m.source && (
                  <p className="text-[10px] text-indigo-400/80 mt-2 pt-1.5 border-t border-slate-800 flex items-center space-x-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Source: {m.source}</span>
                  </p>
                )}
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <Bot className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Querying verified database records &amp; synthesizing guidance...</span>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="py-2.5 flex flex-wrap gap-1.5 border-t border-slate-800/80 mt-2">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setInput(q)}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition truncate"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex items-center space-x-2 pt-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask emergency instructions, find nearest shelter, or ask about alerts..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
