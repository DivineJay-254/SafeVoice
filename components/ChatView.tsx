
import React, { useState, useRef, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';
import { Send, Bot, Loader2, ShieldCheck, AlertTriangle, ExternalLink, Globe, Phone } from 'lucide-react';
import { Chat } from "@google/genai";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isCrisis?: boolean;
}

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello. I am SafeVoice AI. I am here to provide 24/7 anonymous support. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSession = useRef<Chat | null>(null);

  useEffect(() => {
    const session = GeminiService.createChat();
    if (session) chatSession.current = session;
  }, []);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setMessages(prev => [...prev, { id: Date.now().toString(), text: userText, sender: 'user', timestamp: new Date() }]);
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
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: botText, sender: 'bot', timestamp: new Date(), isCrisis }]);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 pb-20 animate-slide-up">
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6 text-pink-600" />
          <h1 className="font-bold dark:text-white">Safe Chat</h1>
        </div>
        <ShieldCheck className="w-5 h-5 text-green-500" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.isCrisis && (
                <div className="mb-2 w-full max-w-[85%] bg-red-600 text-white p-3 rounded-xl border-4 border-red-200 flex items-center gap-3 shadow-lg">
                    <AlertTriangle className="w-10 h-10 animate-pulse" />
                    <div>
                        <p className="font-black text-sm uppercase">Immediate Crisis Detected</p>
                        <a href="tel:1195" className="inline-flex items-center gap-2 mt-1 bg-white text-red-600 px-3 py-1 rounded-full text-xs font-bold">
                            <Phone className="w-3 h-3" /> Piga 1195 Sasa
                        </a>
                    </div>
                </div>
            )}
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-pink-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && <Loader2 className="w-5 h-5 animate-spin text-pink-400" />}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200">
        <form onSubmit={handleSend} className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 p-3 rounded-xl bg-gray-100 dark:bg-gray-700 outline-none" />
          <button type="submit" className="bg-pink-600 text-white p-3 rounded-xl shadow-lg"><Send className="w-5 h-5" /></button>
        </form>
      </div>
    </div>
  );
};
