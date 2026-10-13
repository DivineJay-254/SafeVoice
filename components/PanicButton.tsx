
import React, { useState } from 'react';
import { getTranslation } from '../services/translations';
import { Language } from '../types';
import { Zap, PhoneCall, MessageSquare, ShieldAlert, X } from 'lucide-react';

interface PanicButtonProps {
  lang: Language;
}

export const PanicButton: React.FC<PanicButtonProps> = ({ lang }) => {
  const t = getTranslation(lang);
  const [showModal, setShowModal] = useState(false);
  const [customContact, setCustomContact] = useState(() => localStorage.getItem('juasafety_yako_sos_contact') || '');

  const sendSms = (number: string) => {
    const message = encodeURIComponent(t.panic_msg || "EMERGENCY: I need urgent help right now. Please assist.");
    const ua = navigator.userAgent.toLowerCase();
    let url = `sms:${number}?body=${message}`;
    
    if (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1) {
        url = `sms:${number}&body=${message}`;
    }

    window.location.href = url;
  };

  const handleTrigger = () => {
    const saved = localStorage.getItem('juasafety_yako_sos_contact');
    if (saved) {
      sendSms(saved);
    } else {
      setShowModal(true);
    }
  };

  const handleSaveAndSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (customContact.trim()) {
      localStorage.setItem('juasafety_yako_sos_contact', customContact.trim());
      sendSms(customContact.trim());
      setShowModal(false);
    }
  };

  return (
    <>
      <button
        onClick={handleTrigger}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-red-600 rounded-full shadow-xl flex items-center justify-center animate-pulse hover:scale-110 transition-transform active:bg-red-700 border-4 border-red-200"
        title="Panic Button (Instant SOS SMS)"
      >
        <Zap className="w-8 h-8 text-white fill-current" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Emergency Panic SOS</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300">
              Send an instant emergency SOS SMS alert with your distress signal. Choose an emergency recipient:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  sendSms('1195');
                  setShowModal(false);
                }}
                className="w-full p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-between active:scale-95 transition"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Send SOS to 1195 (National Toll-Free)</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">Fast</span>
              </button>

              <button
                onClick={() => {
                  sendSms('1517');
                  setShowModal(false);
                }}
                className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-between active:scale-95 transition"
              >
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4" />
                  <span>Send SOS to 1517 (UNHCR Kakuma)</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">Camp Desk</span>
              </button>
            </div>

            <form onSubmit={handleSaveAndSend} className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-2">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block">
                Or Save Trusted Friend / Relative Phone:
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="e.g. 0712345678"
                  value={customContact}
                  onChange={(e) => setCustomContact(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-xl text-xs font-bold active:scale-95 transition"
                >
                  Send & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
