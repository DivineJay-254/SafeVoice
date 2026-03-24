
import React from 'react';
import { getTranslation } from '../services/translations';
import { Language } from '../types';
import { Zap } from 'lucide-react';

interface PanicButtonProps {
  lang: Language;
}

export const PanicButton: React.FC<PanicButtonProps> = ({ lang }) => {
  const t = getTranslation(lang);

  const handlePanic = () => {
    const trustedContact = localStorage.getItem('safevoice_sos_contact');
    
    if (!trustedContact) {
      const input = prompt(t.emergency_contact_prompt);
      if (input) {
        localStorage.setItem('safevoice_sos_contact', input);
        sendSms(input);
      } else {
        alert(t.no_contact_alert);
      }
      return;
    }

    sendSms(trustedContact);
  };

  const sendSms = (number: string) => {
    const message = encodeURIComponent(t.panic_msg);
    const ua = navigator.userAgent.toLowerCase();
    let url = `sms:${number}?body=${message}`;
    
    if (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1) {
        url = `sms:${number}&body=${message}`;
    }

    window.location.href = url;
  };

  return (
    <button
      onClick={handlePanic}
      className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-red-600 rounded-full shadow-xl flex items-center justify-center animate-pulse hover:scale-110 transition-transform active:bg-red-700 border-4 border-red-200"
      title="Panic Button (SMS)"
    >
      <Zap className="w-8 h-8 text-white fill-current" />
    </button>
  );
};
