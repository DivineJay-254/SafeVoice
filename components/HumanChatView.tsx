
import React, { useState, useEffect, useRef } from 'react';
import { BackendService } from '../services/mockBackend';
import { ChatMessage, Language } from '../types';
import { Send, X, Loader2, ShieldCheck, MessageSquare, AlertTriangle, Phone, ArrowLeft, Bot, MessageCircleHeart } from 'lucide-react';
import { getTranslation } from '../services/translations';

interface Props {
  lang: Language;
  onClose: () => void;
}

export const HumanChatView: React.FC<Props> = ({ lang, onClose }) => {
  const t = getTranslation(lang);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = useRef(localStorage.getItem('safevoice_anon_id') || 'anon_' + Math.random().toString(36).substring(7)).current;

  useEffect(() => {
    const startSession = async () => {
      const id = await BackendService.startChatSession(userId);
      setSessionId(id);
    };
    startSession();
  }, []);

  useEffect(() => {
    if (sessionId) {
      setLoading(false);
      const unsubscribe = BackendService.subscribeToChatMessages(sessionId, (msgs) => {
        setMessages(msgs);
        scrollToBottom();
      });
      return () => unsubscribe();
    }
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId || sending) return;

    setSending(true);
    try {
      await BackendService.sendChatMessage(sessionId, userId, 'user', input);
      setInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleExit = async () => {
    if (sessionId) {
      await BackendService.closeChatSession(sessionId);
    }
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 animate-slide-up relative z-[80]">
      <header className="bg-brand-600 p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3 text-white">
          <MessageCircleHeart className="w-6 h-6" />
          <div>
            <h2 className="font-bold text-sm leading-tight">Live Support</h2>
            <p className="text-[10px] opacity-80">Anonymous & Confidential</p>
          </div>
        </div>
        <button onClick={handleExit} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all">
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* Security Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 border-b border-yellow-100 dark:border-yellow-900/40 flex items-center gap-2">
        <AlertTriangle className="w-3 h-3 text-yellow-600 flex-shrink-0" />
        <p className="text-[10px] text-yellow-700 dark:text-yellow-400 font-bold leading-tight">
          Emergency? Call 1195. This chat is cleared when you exit.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            <p className="text-xs font-bold text-gray-400">Connecting to an advocate...</p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
               <p className="text-xs text-gray-500 leading-relaxed font-medium">
                 An advocate will be with you shortly. You are currently connected via an anonymous encrypted channel.
               </p>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.senderType === 'user' 
                  ? 'bg-brand-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <footer className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message safely..."
            className="flex-1 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || sending}
            className="bg-brand-600 text-white p-4 rounded-2xl shadow-lg shadow-brand-500/20 disabled:opacity-50 active:scale-95 transition-all"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </footer>
    </div>
  );
};
