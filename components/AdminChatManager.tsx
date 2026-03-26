
import React, { useState, useEffect, useRef } from 'react';
import { DatabaseService } from '../services/databaseService';
import { ChatSession, ChatMessage } from '../types';
import { MessageSquare, User, Clock, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';

import { auth } from '../firebaseConfig';

export const AdminChatManager: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = DatabaseService.subscribeToActiveChatSessions(setSessions);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      const unsubscribe = DatabaseService.subscribeToChatMessages(selectedSession.id, setMessages);
      return () => unsubscribe();
    }
  }, [selectedSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedSession || sending || !auth.currentUser) return;

    setSending(true);
    try {
      await DatabaseService.sendChatMessage(selectedSession.id, auth.currentUser.uid, 'worker', input);
      setInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleCloseChat = async (id: string) => {
    await DatabaseService.closeChatSession(id);
    if (selectedSession?.id === id) setSelectedSession(null);
    setShowCloseConfirm(null);
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
      {/* Sessions List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-gray-500">
            <MessageSquare className="w-4 h-4" /> Active Chats ({sessions.length})
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm italic">No active sessions.</div>
          ) : (
            sessions.map(s => (
              <button 
                key={s.id} 
                onClick={() => setSelectedSession(s)}
                className={`w-full p-4 text-left border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${selectedSession?.id === s.id ? 'bg-brand-50 dark:bg-brand-900/10 border-l-4 border-l-brand-600' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">Anon User</span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {s.lastUpdatedAt?.toDate ? new Date(s.lastUpdatedAt.toDate()).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{s.lastMessage || 'Starting conversation...'}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950">
        {selectedSession ? (
          <>
            <header className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center text-brand-600">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm dark:text-white">Survivor Support Session</h3>
                  <p className="text-[10px] text-gray-400">Encrypted Real-Time Link</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCloseConfirm(selectedSession.id)}
                className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition-all"
              >
                End Session
              </button>
            </header>

            {showCloseConfirm && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 border-b border-red-100 dark:border-red-900/30 flex items-center justify-between animate-fade-in">
                <p className="text-xs font-bold text-red-700 dark:text-red-400">Are you sure you want to end this session? This will archive the chat.</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowCloseConfirm(null)} className="px-3 py-1 rounded bg-white dark:bg-gray-800 text-xs font-bold border">Cancel</button>
                  <button onClick={() => handleCloseChat(showCloseConfirm)} className="px-3 py-1 rounded bg-red-600 text-white text-xs font-bold">End Now</button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderType === 'worker' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.senderType === 'worker' 
                    ? 'bg-brand-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
                  }`}>
                    <p>{msg.text}</p>
                    <span className="text-[9px] opacity-60 mt-1 block text-right">
                      {msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString() : ''}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your response..."
                className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none text-sm"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || sending}
                className="bg-brand-600 text-white px-6 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-700 disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 opacity-20" />
            </div>
            <h3 className="font-bold text-gray-600 dark:text-gray-400">Select a chat to begin support</h3>
            <p className="text-xs max-w-xs mt-2">Pick an active anonymous session from the sidebar to chat with a survivor in real-time.</p>
          </div>
        )}
      </div>
    </div>
  );
};
