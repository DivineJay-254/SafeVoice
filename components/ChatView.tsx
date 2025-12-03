import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, User, Bot, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';

const API_KEY = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello. I am SafeVoice AI. I am here to listen and provide guidance anonymously. I am not a human, but I can help you understand your rights, recognize signs of abuse, or find safety resources. How are you feeling today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Use Gemini to generate response
      let botText = "I'm having trouble connecting right now. Please check your internet.";
      
      if (API_KEY) {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are a compassionate, trauma-informed support assistant for a GBV (Gender Based Violence) app called SafeVoice. 
          Your role is to listen, validate feelings, and provide safe, practical information about rights and resources in Kenya. 
          DO NOT give legal or medical advice definitively. Always encourage seeking professional help (hotline 1195).
          Keep responses concise (under 3 sentences) and supportive.
          
          User said: "${userMsg.text}"`,
        });
        botText = response.text || "I am listening.";
      } else {
        // Fallback for demo without API Key
        await new Promise(r => setTimeout(r, 1000));
        botText = "I hear you. You are brave for sharing. Please remember you can call 1195 for immediate help.";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 pb-20 animate-slide-up">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 dark:text-white">Safe Chat</h1>
            <div className="flex items-center text-xs text-green-500">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              Online • Anonymous
            </div>
          </div>
        </div>
        <ShieldCheck className="w-6 h-6 text-gray-400" />
      </div>

      {/* Safety Banner */}
      <div className="bg-yellow-50 dark:bg-yellow-900/10 p-2 text-center text-xs text-yellow-700 dark:text-yellow-500 flex items-center justify-center gap-2">
         <AlertTriangle className="w-3 h-3" />
         <span>Messages are not monitored by humans. In danger? Call 1195.</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.sender === 'user' 
              ? 'bg-brand-600 text-white rounded-tr-none' 
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-gray-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex justify-start">
             <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-200 dark:border-gray-700">
               <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-3 rounded-xl bg-gray-100 dark:bg-gray-700 border-none outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="bg-brand-600 text-white p-3 rounded-xl disabled:opacity-50 hover:bg-brand-700 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
