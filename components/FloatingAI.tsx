
import React, { useState, useRef, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';
import { Bot, X, Send, Loader2, Sparkles, MessageCircleHeart, ShieldAlert } from 'lucide-react';
import { Chat } from "@google/genai";
import { Language } from '../types';
import { getTranslation } from '../services/translations';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isCrisis?: boolean;
}

export const FloatingAI: React.FC<{ lang: Language }> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hello, I am the SafeVoice AI. I specialize exclusively in support for Gender-Based Violence (GBV). Ask me about safety, rights, or recovery knowledge.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSession = useRef<Chat | null>(null);

  useEffect(() => {
    if (isOpen && !chatSession.current) {
      const session = GeminiService.createChat();
      if (session) chatSession.current = session;
    }
  }, [isOpen]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setMessages(prev => [...prev, { id: Date.now().toString(), text: userText, sender: 'user' }]);
    setInput('');
    setLoading(true);

    try {
      let botText = "";
      if (chatSession.current) {
        try {
          const result = await chatSession.current.sendMessage({ message: userText });
          botText = result.text || "";
        } catch (apiError) {
          botText = GeminiService.getOfflineResponse(userText);
        }
      } else {
        botText = GeminiService.getOfflineResponse(userText);
      }

      const isCrisis = botText.includes("EMERGENCY");
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: botText, sender: 'bot', isCrisis }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err', text: "I'm having trouble connecting. Please call 1195 if you need help.", sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Bubble */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 left-4 z-[60] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform active:scale-90 ${isOpen ? 'bg-gray-800 rotate-90 scale-0' : 'bg-brand-600 scale-100'}`}
      >
        <Sparkles className="w-7 h-7 text-white animate-pulse" />
      </button>

      {/* Chat Window Overlay */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-24 z-[70] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-brand-100 dark:border-gray-700 flex flex-col max-h-[70vh] animate-slide-up overflow-hidden">
          <div className="bg-brand-600 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2 text-white">
               <Bot className="w-5 h-5" />
               <h3 className="font-bold text-sm">SafeVoice AI Support</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.isCrisis && (
                  <div className="mb-2 bg-red-600 text-white p-2 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Crisis Alert
                  </div>
                )}
                <div className={`max-w-[90%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-brand-500 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <Loader2 className="w-5 h-5 animate-spin text-brand-400" />}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <form onSubmit={handleSend} className="flex gap-2">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Ask specialized GBV AI..." 
                className="flex-1 p-3 rounded-2xl bg-white dark:bg-gray-800 text-sm border dark:border-gray-700 outline-none"
              />
              <button type="submit" disabled={loading} className="bg-brand-600 text-white p-3 rounded-2xl shadow-md disabled:opacity-50">
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
