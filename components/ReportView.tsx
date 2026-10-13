import React, { useState, useEffect } from 'react';
import { GBVType, Language } from '../types';
import { DatabaseService } from '../services/databaseService';
import { getTranslation } from '../services/translations';
import { CacheService, ReportTemplate, QueuedOfflineReport } from '../services/cacheService';
import { 
  AlertCircle, Loader2, CheckCircle, Crosshair, ArrowRight, EyeOff, MapPin, 
  Calendar, ListFilter, Phone, Save, Trash2, Satellite, Sparkles, FileText, 
  WifiOff, RefreshCw, BookmarkPlus, Check, ChevronDown, ChevronUp, ShieldAlert
} from 'lucide-react';

interface ReportViewProps {
  onReportSubmitted: (code: string) => void;
  lang: Language;
}

const DRAFT_KEY = 'juasafety_yako_report_draft';

export const ReportView: React.FC<ReportViewProps> = ({ onReportSubmitted, lang }) => {
  const t = getTranslation(lang);
  
  const [type, setType] = useState<GBVType>(GBVType.PHYSICAL);
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [success, setSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isIncognito, setIsIncognito] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [draftSavedFeedback, setDraftSavedFeedback] = useState(false);

  // Templates State (Cached in localStorage)
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);
  const [customTemplateName, setCustomTemplateName] = useState('');
  const [savingCustomTemplate, setSavingCustomTemplate] = useState(false);
  const [templateSavedFeedback, setTemplateSavedFeedback] = useState(false);

  // Offline queue state
  const [queuedReports, setQueuedReports] = useState<QueuedOfflineReport[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load cached templates & queued reports on mount
  useEffect(() => {
    setTemplates(CacheService.getTemplates());
    setQueuedReports(CacheService.getQueuedReports());

    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setType(draft.type || GBVType.PHYSICAL);
        setLocation(draft.location || '');
        setPhoneNumber(draft.phoneNumber || '');
        setIncidentDate(draft.incidentDate || '');
        setDescription(draft.description || '');
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
  }, []);

  const handleApplyTemplate = (tmpl: ReportTemplate) => {
    setSelectedTemplate(tmpl);
    setType(tmpl.category);
    if (!location.trim() || location === tmpl.defaultLocation) {
      setLocation(tmpl.defaultLocation);
    }
    setDescription(tmpl.defaultDetails);
    setErrorMsg(null);
  };

  const handleSaveDraft = () => {
    const draft = { type, location, phoneNumber, incidentDate, description };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setDraftSavedFeedback(true);
    setTimeout(() => setDraftSavedFeedback(false), 2000);
  };

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setLocation('');
    setPhoneNumber('');
    setIncidentDate('');
    setDescription('');
    setType(GBVType.PHYSICAL);
    setSelectedTemplate(null);
    setShowClearConfirm(false);
  };

  const handleSaveAsCustomTemplate = () => {
    if (!customTemplateName.trim()) return;
    const newTmpl: ReportTemplate = {
      id: `custom-${Date.now()}`,
      title: customTemplateName.trim(),
      category: type,
      description: 'Custom cached report template',
      defaultLocation: location,
      defaultDetails: description,
      urgency: 'medium',
      requiresImmediateMedical: type === GBVType.PHYSICAL || type === GBVType.SEXUAL,
      suggestedSteps: ['Review report details', 'Submit securely via cached device storage']
    };
    CacheService.saveCustomTemplate(newTmpl);
    setTemplates(CacheService.getTemplates());
    setSelectedTemplate(newTmpl);
    setCustomTemplateName('');
    setSavingCustomTemplate(false);
    setTemplateSavedFeedback(true);
    setTimeout(() => setTemplateSavedFeedback(false), 2500);
  };

  const handleSyncPending = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await DatabaseService.syncOfflineReports();
      setQueuedReports(CacheService.getQueuedReports());
      if (result.synced > 0) {
        setSyncFeedback(`Successfully synchronized ${result.synced} report(s) to cloud database!`);
      } else if (result.failed > 0) {
        setSyncFeedback(`Sync pending: server unreachable. Reports remain safe in local cache.`);
      } else {
        setSyncFeedback(`All cached reports are already synchronized.`);
      }
    } catch (e) {
      setSyncFeedback('Sync failed. Device cache remains intact.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
        setErrorMsg("Geolocation is not supported by your browser");
        return;
    }
    setGettingLocation(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;
            setLocation(mapLink);
            setGettingLocation(false);
        },
        (error) => {
            let msg = "Unable to retrieve location.";
            if (error.code === 1) msg = "Permission denied. Please allow location access.";
            if (error.code === 3) msg = "GPS timeout. Try moving to an open area.";
            setErrorMsg(msg);
            setGettingLocation(false);
        },
        { 
          enableHighAccuracy: true,
          timeout: 20000,
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

    const anonymousUserId = isIncognito ? 'anon_' + Math.random().toString(36).substring(7) : (localStorage.getItem('juasafety_yako_anon_id') || 'anon_user');

    setIsSubmitting(true);
    try {
      const report = await DatabaseService.createReport({
        type,
        location,
        phoneNumber,
        incidentDate: incidentDate || new Date().toISOString(),
        description: description.trim() || `Report of ${type} at ${location}.`,
        attachments: [],
        anonymousUserId,
        templateId: selectedTemplate?.id
      });
      setTrackingCode(report.trackingCode);
      setIsOfflineSaved(report.trackingCode.startsWith('OFFLINE-'));
      setSuccess(true);
      setQueuedReports(CacheService.getQueuedReports());
      
      // Clear draft on successful submission
      localStorage.removeItem(DRAFT_KEY);
      if (!isIncognito && !localStorage.getItem('juasafety_yako_anon_id')) {
        localStorage.setItem('juasafety_yako_anon_id', anonymousUserId);
      }
      setTimeout(() => onReportSubmitted(report.trackingCode), 3200);
    } catch (error: any) {
      setErrorMsg(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-fade-in">
        <div className={`w-20 h-20 ${isOfflineSaved ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'} rounded-full flex items-center justify-center mb-4 shadow-md`}>
          {isOfflineSaved ? <WifiOff className="w-10 h-10" /> : <CheckCircle className="w-10 h-10" />}
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isOfflineSaved ? 'Report Saved to Offline Storage' : 'Report Sent Successfully'}
        </h2>
        <p className="text-xs text-gray-500 mb-4 max-w-xs">
          {isOfflineSaved 
            ? 'Your report is securely stored in device localStorage. It will automatically synchronize to case workers as soon as internet connection is restored.'
            : 'Your confidential report has been submitted to protection services.'
          }
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl mb-6 border-2 border-dashed border-gray-300 dark:border-gray-700 w-full max-w-xs">
          <span className="text-xs uppercase font-bold text-gray-400 block mb-1">Confidential Tracking Code</span>
          <span className="text-2xl font-mono font-bold text-brand-600 tracking-wider select-all">{trackingCode}</span>
        </div>
        <p className="text-xs text-gray-400 animate-pulse">Redirecting to case tracking...</p>
      </div>
    );
  }

  const unsyncedCount = queuedReports.filter(r => !r.synced).length;

  return (
    <div className="p-4 pb-24 animate-slide-up relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-700 dark:text-brand-400">{t.report_title}</h1>
          <p className="text-[11px] text-gray-500">Encrypted incident report with offline device caching</p>
        </div>
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
             onClick={() => setShowClearConfirm(true)} 
             className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-red-600 transition-all"
             title={t.clear_draft}
           >
             <Trash2 className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Offline Status or Pending Reports Banner */}
      {(!isOnline || unsyncedCount > 0) && (
        <div className="mb-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3 rounded-2xl flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                {!isOnline ? 'Offline Storage Mode Active' : `${unsyncedCount} Queued Report(s) Pending Sync`}
              </p>
              <p className="text-[10px] text-amber-700 dark:text-amber-400">
                Templates & resources are cached locally. Reports remain safe even without connection.
              </p>
            </div>
          </div>
          {unsyncedCount > 0 && isOnline && (
            <button
              onClick={handleSyncPending}
              disabled={isSyncing}
              className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow transition active:scale-95 flex-shrink-0"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync'}
            </button>
          )}
        </div>
      )}

      {syncFeedback && (
        <div className="mb-4 p-2.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl animate-fade-in">
          {syncFeedback}
        </div>
      )}

      {showClearConfirm && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center justify-between animate-fade-in">
          <p className="text-xs font-bold text-red-700 dark:text-red-400">Clear your report draft? This cannot be undone.</p>
          <div className="flex gap-2">
            <button onClick={() => setShowClearConfirm(false)} className="px-3 py-1 bg-white dark:bg-gray-800 text-xs font-bold border rounded">Cancel</button>
            <button onClick={handleClearDraft} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded">Clear</button>
          </div>
        </div>
      )}

      {/* Report Templates Section (Cached in localStorage) */}
      <div className="mb-5 bg-gradient-to-br from-brand-50 to-purple-50 dark:from-gray-800/80 dark:to-brand-950/20 border border-brand-100 dark:border-brand-900/40 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-800 dark:text-brand-300">
              Cached Report Templates
            </h3>
            <span className="text-[9px] bg-brand-200/60 dark:bg-brand-900/50 text-brand-800 dark:text-brand-200 font-bold px-1.5 py-0.5 rounded-full">
              Offline Ready
            </span>
          </div>
          <button 
            type="button" 
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-gray-400 hover:text-brand-600 transition"
          >
            {showTemplates ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showTemplates && (
          <div className="space-y-2 mt-3 animate-fade-in">
            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug">
              Select a pre-configured template to autofill standard incident details and instant protection instructions:
            </p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {templates.map(tmpl => {
                const isSelected = selectedTemplate?.id === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className={`flex-shrink-0 text-left p-3 rounded-xl border text-xs font-bold transition-all max-w-[200px] ${
                      isSelected 
                        ? 'bg-brand-600 border-brand-600 text-white shadow-md scale-[1.02]' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brand-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] uppercase font-black tracking-tight line-clamp-1">
                        {tmpl.title}
                      </span>
                      {tmpl.urgency === 'critical' && (
                        <span className={`text-[8px] px-1 rounded font-black ${isSelected ? 'bg-white text-red-600' : 'bg-red-100 text-red-700'}`}>
                          URGENT
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] line-clamp-2 ${isSelected ? 'text-brand-100' : 'text-gray-400'}`}>
                      {tmpl.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Template Action Banner when selected */}
            {selectedTemplate && (
              <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-brand-200 dark:border-brand-800 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-brand-700 dark:text-brand-400 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5" /> Template: {selectedTemplate.title}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setSelectedTemplate(null)}
                    className="text-[10px] text-gray-400 hover:text-red-500"
                  >
                    Clear template
                  </button>
                </div>
                {selectedTemplate.requiresImmediateMedical && (
                  <div className="mb-2 bg-red-50 dark:bg-red-950/40 p-2 rounded-lg border border-red-200 text-red-700 dark:text-red-300 text-[11px] font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>Emergency clinical window applies (PEP within 72h / clinic care).</span>
                  </div>
                )}
                {selectedTemplate.suggestedSteps && (
                  <ul className="text-[10px] text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside">
                    {selectedTemplate.suggestedSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Safety Alert */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-3 mb-4 rounded-r flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-700 dark:text-yellow-200">{t.safety_priority}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Incognito Toggle */}
        <div 
          className={`p-3.5 rounded-xl border-2 transition-colors cursor-pointer flex items-center gap-3 ${
            isIncognito 
              ? 'bg-gray-800 border-gray-600 text-white' 
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
          }`} 
          onClick={() => setIsIncognito(!isIncognito)}
        >
           <EyeOff className="w-5 h-5" />
           <div className="flex-1 text-xs font-bold">{t.incognito_mode}</div>
           {isIncognito && <span className="text-[10px] bg-gray-700 px-2 py-0.5 rounded text-gray-300 font-bold">Active</span>}
        </div>

        {errorMsg && <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-xs font-bold border border-red-100">{errorMsg}</div>}

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400 mb-2">
                <ListFilter className="w-3 h-3" /> {t.type_incident}
              </label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value as GBVType)} 
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium"
              >
                {Object.values(GBVType).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400 mb-2">
                <Calendar className="w-3 h-3" /> {t.time_incident}
              </label>
              <input 
                type="datetime-local" 
                value={incidentDate} 
                onChange={(e) => setIncidentDate(e.target.value)} 
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm" 
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400 mb-2">
                <MapPin className="w-3 h-3" /> {t.location}
              </label>

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
                <input 
                  type="text" 
                  placeholder={t.location_placeholder} 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={handleGetGPS} 
                  disabled={gettingLocation} 
                  className={`bg-brand-600 text-white p-3 rounded-xl shadow-sm flex-shrink-0 transition-all ${gettingLocation ? 'animate-pulse scale-95 opacity-80' : 'active:scale-90'}`}
                  title="Acquire precise GPS coordinates"
                >
                    {gettingLocation ? <Loader2 className="animate-spin w-5 h-5"/> : <Crosshair className="w-5 h-5" />}
                </button>
              </div>
              {location.includes('maps.google.com') && !gettingLocation && (
                <div className="mt-2 text-[10px] text-green-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {t.gps_locked}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400 mb-2">
                <FileText className="w-3 h-3" /> Incident Details & Needs
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred, any injuries, perpetrator relation, or immediate assistance required..."
                rows={3}
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm leading-relaxed"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400 mb-2">
                <Phone className="w-3 h-3" /> {t.phone_number} (Optional / for safe callback)
              </label>
              <input 
                type="tel" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)} 
                placeholder="+254..." 
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm" 
              />
            </div>
        </div>

        {/* Custom Template Saver */}
        <div className="flex items-center justify-between px-1">
          {!savingCustomTemplate ? (
            <button
              type="button"
              onClick={() => setSavingCustomTemplate(true)}
              className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-bold"
            >
              <BookmarkPlus className="w-3.5 h-3.5" /> Save these details as custom template
            </button>
          ) : (
            <div className="flex gap-2 w-full animate-fade-in">
              <input
                type="text"
                placeholder="Template name (e.g. My Block Incident)"
                value={customTemplateName}
                onChange={(e) => setCustomTemplateName(e.target.value)}
                className="flex-1 p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
              />
              <button
                type="button"
                onClick={handleSaveAsCustomTemplate}
                className="bg-brand-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold active:scale-95 transition"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setSavingCustomTemplate(false)}
                className="text-gray-400 text-xs px-2"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {templateSavedFeedback && (
          <p className="text-center text-xs font-bold text-green-600 animate-fade-in">
            ✓ Custom template cached in local storage!
          </p>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full bg-brand-600 hover:bg-brand-700 text-white p-4 rounded-2xl font-bold shadow-lg shadow-brand-500/20 disabled:opacity-70 flex justify-center items-center transition-all active:scale-95"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin w-5 h-5 mr-2" />
          ) : !isOnline ? (
            <span className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" /> Save to Offline Reports Cache
            </span>
          ) : (
            t.submit_btn
          )}
        </button>
        
        {draftSavedFeedback && (
          <p className="text-center text-xs font-bold text-green-600 animate-fade-in">{t.draft_saved}</p>
        )}
      </form>
    </div>
  );
};
