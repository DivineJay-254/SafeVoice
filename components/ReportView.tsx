
import React, { useState, useEffect } from 'react';
import { GBVType, Language } from '../types';
import { BackendService } from '../services/mockBackend';
import { getTranslation } from '../services/translations';
import { AlertCircle, Loader2, CheckCircle, Crosshair, ArrowRight, EyeOff, MapPin, Calendar, ListFilter, Map, Phone, Save, Trash2, Info, Satellite } from 'lucide-react';

interface ReportViewProps {
  onReportSubmitted: (code: string) => void;
  lang: Language;
}

const DRAFT_KEY = 'safevoice_report_draft';

export const ReportView: React.FC<ReportViewProps> = ({ onReportSubmitted, lang }) => {
  const t = getTranslation(lang);
  
  const [type, setType] = useState<GBVType>(GBVType.PHYSICAL);
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [success, setSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isIncognito, setIsIncognito] = useState(false);
  const [draftSavedFeedback, setDraftSavedFeedback] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setType(draft.type || GBVType.PHYSICAL);
        setLocation(draft.location || '');
        setPhoneNumber(draft.phoneNumber || '');
        setIncidentDate(draft.incidentDate || '');
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
  }, []);

  const handleSaveDraft = () => {
    const draft = { type, location, phoneNumber, incidentDate };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setDraftSavedFeedback(true);
    setTimeout(() => setDraftSavedFeedback(false), 2000);
  };

  const handleClearDraft = () => {
    if (confirm(t.clear_draft + "?")) {
      localStorage.removeItem(DRAFT_KEY);
      setLocation('');
      setPhoneNumber('');
      setIncidentDate('');
      setType(GBVType.PHYSICAL);
    }
  };

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }
    setGettingLocation(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            // Higher accuracy is crucial for regions like Kakuma
            const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;
            setLocation(mapLink);
            setGettingLocation(false);
            console.log(`GPS Fixed with accuracy: ${accuracy}m`);
        },
        (error) => {
            let msg = "Unable to retrieve location.";
            if (error.code === 1) msg = "Permission denied. Please allow location access.";
            if (error.code === 3) msg = "GPS timeout. Try moving to an open area.";
            setErrorMsg(msg);
            setGettingLocation(false);
        },
        { 
          enableHighAccuracy: true, // MUST be true for precise Kakuma coordinates
          timeout: 20000,           // Increased timeout for remote areas
          maximumAge: 0 
        }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!location.trim()) {
        setErrorMsg("Please provide a location.");
        return;
    }

    const anonymousUserId = isIncognito ? 'anon_' + Math.random().toString(36).substring(7) : (localStorage.getItem('safevoice_anon_id') || 'anon_user');

    setIsSubmitting(true);
    try {
      const report = await BackendService.createReport({
        type,
        location,
        phoneNumber,
        incidentDate: incidentDate || new Date().toISOString(),
        description: `Automatic report of ${type} at ${location}.`,
        attachments: [],
        anonymousUserId
      });
      setTrackingCode(report.trackingCode);
      setSuccess(true);
      // Clear draft on successful submission
      localStorage.removeItem(DRAFT_KEY);
      setTimeout(() => onReportSubmitted(report.trackingCode), 3000);
    } catch (error: any) {
      setErrorMsg(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Report Sent</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl mb-6 border-2 border-dashed border-gray-300">
          <span className="text-3xl font-mono font-bold text-brand-600 tracking-wider">{trackingCode}</span>
        </div>
        <p className="text-sm text-gray-500">Redirecting to tracking view...</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 animate-slide-up relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand-700 dark:text-brand-400">{t.report_title}</h1>
        <div className="flex gap-2">
           <button 
             type="button" 
             onClick={handleSaveDraft} 
             className={`p-2 rounded-full transition-all ${draftSavedFeedback ? 'bg-green-100 text-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-brand-600'}`}
             title={t.save_as_draft}
           >
             {draftSavedFeedback ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
           </button>
           <button 
             type="button" 
             onClick={handleClearDraft} 
             className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-red-600 transition-all"
             title={t.clear_draft}
           >
             <Trash2 className="w-5 h-5" />
           </button>
        </div>
      </div>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-4 rounded-r flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
        <p className="text-sm text-yellow-700 dark:text-yellow-200">{t.safety_priority}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={`p-4 rounded-xl border-2 transition-colors cursor-pointer flex items-center gap-3 ${isIncognito ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`} onClick={() => setIsIncognito(!isIncognito)}>
           <EyeOff className="w-5 h-5" />
           <div className="flex-1 text-sm font-bold">{t.incognito_mode}</div>
        </div>

        {errorMsg && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">{errorMsg}</div>}

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400 mb-2">
                <ListFilter className="w-3 h-3" /> {t.type_incident}
              </label>
              <select value={type} onChange={(e) => setType(e.target.value as GBVType)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium">
                {Object.values(GBVType).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400 mb-2">
                <Calendar className="w-3 h-3" /> {t.time_incident}
              </label>
              <input type="datetime-local" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm" />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400 mb-2">
                <MapPin className="w-3 h-3" /> {t.location}
              </label>

              {/* GPS Precision Prompt */}
              {gettingLocation && (
                <div className="mb-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-3 rounded-xl animate-pulse flex gap-3">
                  <Satellite className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-[11px] font-black text-blue-800 dark:text-blue-300 uppercase tracking-tighter mb-0.5">{t.gps_hint_title}</h4>
                    <p className="text-[10px] text-blue-700 dark:text-blue-400 leading-tight">
                      {t.gps_hint_body}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <input type="text" placeholder={t.location_placeholder} value={location} onChange={(e) => setLocation(e.target.value)} className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm" required />
                <button type="button" onClick={handleGetGPS} disabled={gettingLocation} className={`bg-brand-600 text-white p-3 rounded-xl shadow-sm flex-shrink-0 transition-all ${gettingLocation ? 'animate-pulse scale-95 opacity-80' : 'active:scale-90'}`}>
                    {gettingLocation ? <Loader2 className="animate-spin w-5 h-5"/> : <Crosshair className="w-5 h-5" />}
                </button>
              </div>
              {location.includes('maps.google.com') && !gettingLocation && (
                <div className="mt-2 text-[10px] text-green-600 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {t.gps_locked}</div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400 mb-2">
                <Phone className="w-3 h-3" /> {t.phone_number}
              </label>
              <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+254..." className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm" />
            </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-brand-600 hover:bg-brand-700 text-white p-5 rounded-2xl font-bold shadow-lg shadow-brand-500/20 disabled:opacity-70 flex justify-center items-center transition-all active:scale-95">
          {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : t.submit_btn}
        </button>
        
        {draftSavedFeedback && (
          <p className="text-center text-xs font-bold text-green-600 animate-fade-in">{t.draft_saved}</p>
        )}
      </form>
    </div>
  );
};
