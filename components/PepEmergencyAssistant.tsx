import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  HeartPulse, 
  PhoneCall, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Navigation,
  FileText,
  Calendar,
  Sparkles
} from 'lucide-react';
import { SupportCentre } from '../types';
import { DEFAULT_SUPPORT_CENTRES } from '../services/cacheService';

interface PepEmergencyProps {
  onBack: () => void;
  onNavigateToCentres: () => void;
}

export const PepEmergencyAssistant: React.FC<PepEmergencyProps> = ({ onBack, onNavigateToCentres }) => {
  const [incidentHoursAgo, setIncidentHoursAgo] = useState<number>(0);
  const [selectedIncidentTime, setSelectedIncidentTime] = useState<string>('just_now');
  const [customHours, setCustomHours] = useState<string>('');

  const TOTAL_WINDOW_HOURS = 72;
  const remainingHours = Math.max(0, TOTAL_WINDOW_HOURS - incidentHoursAgo);
  const percentLeft = Math.round((remainingHours / TOTAL_WINDOW_HOURS) * 100);

  const isCriticalWindow = remainingHours > 0;
  const isEmergencyContraceptionWindow = incidentHoursAgo <= 120; // 5 days

  const updateWindow = (timeKey: string, customVal?: number) => {
    setSelectedIncidentTime(timeKey);
    let hrs = 0;
    if (timeKey === 'just_now') hrs = 1;
    else if (timeKey === 'last_night') hrs = 12;
    else if (timeKey === 'yesterday') hrs = 24;
    else if (timeKey === 'two_days') hrs = 48;
    else if (timeKey === 'three_days') hrs = 68;
    else if (timeKey === 'custom' && customVal !== undefined) hrs = customVal;
    setIncidentHoursAgo(hrs);
  };

  useEffect(() => {
    updateWindow('just_now');
  }, []);

  return (
    <div className="p-4 pb-24 animate-slide-up bg-white dark:bg-gray-900 min-h-full flex flex-col space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between sticky top-0 bg-white/95 dark:bg-gray-900/95 py-2 z-10 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={onBack}
          className="flex items-center text-rose-600 dark:text-rose-400 font-bold text-xs hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Safety Portal
        </button>
        <span className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
          Immediate Medical Care
        </span>
      </div>

      {/* Hero Banner: 72-Hour Golden Window Timer */}
      <div className="bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              Emergency HIV Prevention Protocol
            </span>
            <Clock className="w-6 h-6 text-white/80 animate-pulse" />
          </div>

          <div>
            <h1 className="text-2xl font-black leading-tight">
              72-Hour Medical Window
            </h1>
            <p className="text-xs text-rose-100 mt-1">
              Post-Exposure Prophylaxis (PEP) prevents HIV infection by over 80–90% if taken within 72 hours of sexual assault.
            </p>
          </div>

          {/* Incident Timing Selector */}
          <div className="pt-2">
            <label className="text-[11px] font-bold text-rose-100 block mb-1.5">
              When did the assault happen?
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-bold text-gray-900">
              {[
                { key: 'just_now', label: 'Just now (<2h)' },
                { key: 'last_night', label: 'Last night (~12h)' },
                { key: 'yesterday', label: 'Yesterday (~24h)' },
                { key: 'two_days', label: '2 days ago (48h)' },
                { key: 'three_days', label: 'Near 72h limit' },
                { key: 'custom', label: 'Custom hrs' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => {
                    if (t.key === 'custom') {
                      const val = prompt('Approximately how many hours ago did the incident occur?', '36');
                      if (val) {
                        const parsed = Math.max(0, parseInt(val, 10) || 0);
                        setCustomHours(String(parsed));
                        updateWindow('custom', parsed);
                      }
                    } else {
                      updateWindow(t.key);
                    }
                  }}
                  className={`p-2 rounded-xl text-[10px] transition text-center ${
                    selectedIncidentTime === t.key
                      ? 'bg-white text-rose-700 shadow-md font-black'
                      : 'bg-rose-800/60 hover:bg-rose-800 text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live countdown gauge */}
          <div className="bg-black/20 p-4 rounded-2xl border border-white/20 mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-rose-100 uppercase tracking-wider text-[10px]">
                Time Remaining for HIV PEP:
              </span>
              <span className="font-mono text-sm font-black">
                {isCriticalWindow ? `${remainingHours} Hours Left` : 'Window Expired (>72h)'}
              </span>
            </div>

            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  remainingHours > 24 ? 'bg-emerald-400' : remainingHours > 0 ? 'bg-amber-400' : 'bg-red-400'
                }`}
                style={{ width: `${percentLeft}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-rose-200 mt-2 font-mono">
              <span>0h (Incident)</span>
              <span>24h</span>
              <span>48h</span>
              <span className="font-bold text-white">72h (PEP Limit)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Call to Clinic Button */}
      <div className="grid grid-cols-2 gap-2">
        <a 
          href="tel:1517"
          className="bg-red-600 hover:bg-red-700 text-white p-3.5 rounded-2xl flex items-center justify-center gap-2 font-black text-xs shadow-lg active:scale-95 transition"
        >
          <PhoneCall className="w-4 h-4 flex-shrink-0" />
          <span>Call UNHCR (1517)</span>
        </a>
        <a 
          href="tel:1195"
          className="bg-brand-600 hover:bg-brand-700 text-white p-3.5 rounded-2xl flex items-center justify-center gap-2 font-black text-xs shadow-lg active:scale-95 transition"
        >
          <PhoneCall className="w-4 h-4 flex-shrink-0" />
          <span>National GBV (1195)</span>
        </a>
      </div>

      {/* Urgent Clinical Instructions: Do's and Don'ts */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-black text-xs uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Critical Instructions Before Reaching Clinic</span>
        </div>

        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="flex items-start gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/30">
            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-900 dark:text-white">DO NOT Wash, Bathe, or Douche (If Safe):</strong>
              <p className="text-gray-600 dark:text-gray-300 text-[11px] mt-0.5">
                Bathing washes away biological forensic DNA evidence crucial for police P3 forms.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/30">
            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-900 dark:text-white">DO NOT Change Clothes (Or Keep in Paper Bag):</strong>
              <p className="text-gray-600 dark:text-gray-300 text-[11px] mt-0.5">
                Keep the clothes worn in a clean dry paper bag (avoid plastic bags which trap moisture).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-900 dark:text-white">BATHED ALREADY? YOU MUST STILL GO:</strong>
              <p className="text-gray-600 dark:text-gray-300 text-[11px] mt-0.5">
                Even if you bathed or changed clothes, PEP medication, STI antibiotics, and emergency contraception are 100% effective and available!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contraceptive Window Note */}
      <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 p-3.5 rounded-2xl flex items-center justify-between text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] font-black uppercase text-sky-700 dark:text-sky-300 tracking-wider">
            Pregnancy Prevention Window
          </span>
          <p className="text-[11px] text-sky-900 dark:text-sky-200">
            Emergency contraception works up to <strong>120 hours (5 days)</strong>, with highest efficacy in first 24–72h.
          </p>
        </div>
      </div>

      {/* Verified Clinics Directory */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Nearest Free Clinical Desks (Kakuma & Kalobeyei)
          </h3>
          <button 
            onClick={onNavigateToCentres}
            className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-1"
          >
            <Navigation className="w-3.5 h-3.5" /> Full Directory
          </button>
        </div>

        <div className="space-y-2">
          {DEFAULT_SUPPORT_CENTRES.filter(c => c.type === 'Medical').map((centre) => (
            <div 
              key={centre.id}
              className="bg-white dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded">
                    Free Care
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">{centre.distance}</span>
                </div>
                <h4 className="font-bold text-xs text-gray-900 dark:text-white">{centre.name}</h4>
                <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" /> {centre.address}
                </p>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(centre.name + ' ' + centre.address)}&travelmode=walking`}
                target="_blank"
                rel="noreferrer"
                className="bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300 p-2.5 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-95 transition"
                title="Walking route"
              >
                <Navigation className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
