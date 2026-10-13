
import React, { useState, useEffect } from 'react';
import { AppView, Language } from './types';
import { ReportView } from './components/ReportView';
import { TrackView } from './components/TrackView';
import { EducationView } from './components/EducationView';
import { HotlinesView } from './components/HotlinesView';
import { SafetyPlanView } from './components/SafetyPlanView';
import { HumanChatView } from './components/HumanChatView';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { PanicButton } from './components/PanicButton';
import { FloatingAI } from './components/FloatingAI'; 
import { PWAInstallButton } from './components/PWAInstallButton';
import { useOnlineStatus } from './components/useOnlineStatus';
import { CamouflageView } from './components/CamouflageView';
import { PepEmergencyAssistant } from './components/PepEmergencyAssistant';
import { DatabaseService } from './services/databaseService';
import { CacheService } from './services/cacheService';
import { getTranslation, TRANSLATIONS } from './services/translations';
import { 
  Home, 
  FilePlus, 
  BookOpen, 
  Phone, 
  Bell, 
  Moon, 
  Sun, 
  UserCircle, 
  Shield, 
  LogOut, 
  Globe, 
  WifiOff, 
  Settings, 
  Languages, 
  GraduationCap, 
  MessageCircleHeart, 
  RefreshCw, 
  CheckCircle2, 
  HardDriveDownload,
  Calculator,
  EyeOff,
  Clock,
  HeartPulse,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [lastTrackingCode, setLastTrackingCode] = useState<string>('');
  const [lastKnownStatus, setLastKnownStatus] = useState<string>('');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [logoTaps, setLogoTaps] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRetryingConnection, setIsRetryingConnection] = useState(false);
  const isOnline = useOnlineStatus();

  const t = getTranslation(lang);

  const checkConnectionStatus = async () => {
    setIsRetryingConnection(true);
    try {
      const result = await DatabaseService.checkConnection();
      if (!result.success) {
        setConnectionError(result.message || "Connection error. Cached resources active.");
      } else {
        setConnectionError(null);
        // Try auto-syncing any queued offline reports
        DatabaseService.syncOfflineReports().then(syncRes => {
          if (syncRes.synced > 0) {
            setNotifications(prev => [...prev, `Synced ${syncRes.synced} offline report(s) successfully`]);
          }
        });
      }
    } finally {
      setIsRetryingConnection(false);
    }
  };

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    const history = DatabaseService.getHistory();
    if (history.length > 0) {
        setLastTrackingCode(history[0]);
    }
    checkConnectionStatus();
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setConnectionError("Offline mode — report templates and emergency directory are cached on device.");
    } else if (connectionError?.includes('Offline mode')) {
      checkConnectionStatus();
    }
  }, [isOnline]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const [stealthAutoClear, setStealthAutoClear] = useState<boolean>(() => {
    return localStorage.getItem('juasafety_stealth_autoclear') === 'true';
  });
  const [showSafetySettings, setShowSafetySettings] = useState(false);

  // Stealth auto-clear on minimize / tab switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && stealthAutoClear) {
        localStorage.removeItem('juasafety_report_draft');
        localStorage.removeItem('juasafety_yako_report_history');
        sessionStorage.clear();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [stealthAutoClear]);

  const toggleStealthAutoClear = () => {
    const nextVal = !stealthAutoClear;
    setStealthAutoClear(nextVal);
    localStorage.setItem('juasafety_stealth_autoclear', String(nextVal));
    if (nextVal) {
      setNotifications(prev => [...prev, "Stealth Auto-Clear enabled: drafts and history clear on exit or minimize"]);
    }
  };

  const handleQuickExit = () => {
    if (stealthAutoClear) {
      localStorage.removeItem('juasafety_report_draft');
      localStorage.removeItem('juasafety_yako_report_history');
      sessionStorage.clear();
    }
    window.location.replace("https://www.google.com/search?q=weather+today");
  };

  const handleReportSubmitted = (code: string) => {
    setLastTrackingCode(code);
    setLastKnownStatus('');
    setView(AppView.TRACK);
    setNotifications(prev => [...prev, `Report submitted: ${code}`]);
  };

  const handleLogoTap = () => {
    setLogoTaps(prev => {
      const newCount = prev + 1;
      if (newCount >= 7) {
        setView(AppView.ADMIN_LOGIN);
        return 0;
      }
      return newCount;
    });
    setTimeout(() => setLogoTaps(0), 2000);
  };

  const NavButton: React.FC<{ target: AppView; icon: React.ReactNode; label: string }> = ({ target, icon, label }) => (
    <button 
      onClick={() => setView(target)}
      className={`flex flex-col items-center justify-center w-full py-3 transition-colors ${
        view === target ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
      }`}
    >
      {icon}
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );

  const isAdminView = view === AppView.ADMIN_DASHBOARD;

  // Discreet Camouflage Full-screen skin
  if (view === AppView.CAMOUFLAGE) {
    return (
      <div className="flex justify-center min-h-screen bg-slate-900">
        <div className="w-full max-w-md h-[100dvh] relative shadow-2xl overflow-hidden flex flex-col">
          <CamouflageView onUnlock={() => setView(AppView.HOME)} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen bg-gray-200 dark:bg-black">
      <div className={`w-full ${isAdminView ? 'max-w-none' : 'max-w-md'} bg-white dark:bg-gray-900 h-[100dvh] relative shadow-2xl overflow-hidden flex flex-col transition-all duration-300`}>
        {!isAdminView && view !== AppView.ADMIN_LOGIN && view !== AppView.HUMAN_CHAT && (
          <>
            <PanicButton lang={lang} />
            <FloatingAI lang={lang} /> 
          </>
        )}

        {view !== AppView.ADMIN_LOGIN && view !== AppView.ADMIN_DASHBOARD && view !== AppView.HUMAN_CHAT && (
          <header className="flex flex-col bg-white dark:bg-gray-900 sticky top-0 z-20 border-b border-gray-100 dark:border-gray-800">
            <div className="px-4 py-3 flex justify-between items-center backdrop-blur-md">
              <div onClick={handleLogoTap} className="flex items-center gap-2 cursor-pointer select-none active:opacity-70 transition-opacity">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">JY</div>
                <h1 className="font-bold text-lg tracking-tight text-gray-800 dark:text-white hidden sm:block">Juasafety Yako</h1>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Camouflage / Disguise Button */}
                <button 
                  onClick={() => setView(AppView.CAMOUFLAGE)} 
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-full text-xs font-bold flex items-center shadow-sm transition-transform active:scale-95"
                  title="Switch to calculator disguise"
                >
                  <Calculator className="w-3.5 h-3.5 mr-1 text-slate-300" /> Disguise
                </button>

                {/* Stealth Safety Settings */}
                <button
                  onClick={() => setShowSafetySettings(true)}
                  className={`p-1.5 rounded-full transition-colors ${
                    stealthAutoClear 
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200' 
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title="Discreet Safety & Stealth Settings"
                >
                  <EyeOff className="w-4 h-4" />
                </button>

                <PWAInstallButton />
                <button onClick={handleQuickExit} className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-full text-xs font-bold flex items-center shadow-sm transition-transform active:scale-95">
                  <LogOut className="w-3 h-3 mr-1" /> {t.quick_exit}
                </button>
                <button onClick={() => setDarkMode(!darkMode)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
                </button>
                <div className="relative">
                   <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                   {notifications.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>}
                </div>
              </div>
            </div>
            
            <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
               <Languages className="w-4 h-4 text-gray-400 flex-shrink-0" />
               {Object.keys(TRANSLATIONS).map((code) => (
                 <button 
                   key={code}
                   onClick={() => setLang(code as Language)}
                   className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-all border ${
                     lang === code 
                     ? 'bg-brand-500 border-brand-500 text-white shadow-sm' 
                     : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                   }`}
                 >
                   {TRANSLATIONS[code].name}
                 </button>
               ))}
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto no-scrollbar relative">
          {connectionError && (
              <div className="bg-gradient-to-r from-amber-600 via-pink-700 to-rose-700 text-white text-[11px] p-2.5 px-3 flex items-center justify-between font-bold sticky top-0 z-50 shadow-md">
                  <div className="flex items-center gap-2 flex-1 pr-2">
                      <WifiOff className="w-4 h-4 text-amber-200 flex-shrink-0 animate-pulse" />
                      <span className="leading-tight font-medium">
                        {connectionError}
                      </span>
                  </div>
                  <button
                    onClick={checkConnectionStatus}
                    disabled={isRetryingConnection}
                    className="bg-white/20 hover:bg-white/30 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg font-black flex items-center gap-1 flex-shrink-0 transition active:scale-95"
                    title="Check network and sync queued offline reports"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRetryingConnection ? 'animate-spin' : ''}`} />
                    Retry
                  </button>
              </div>
          )}

          {view === AppView.HOME && (
            <div className="p-6 animate-fade-in pb-20">
               <div className="mb-6">
                 <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t.welcome}</h2>
                 <p className="text-gray-500 dark:text-gray-400">{t.safe_msg}</p>
               </div>

               {/* Offline Safety Cache Status Banner */}
               <div className="mb-4 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/20 border border-teal-200 dark:border-teal-800/60 p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
                 <div className="flex items-center gap-2.5 pr-2">
                   <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                     <HardDriveDownload className="w-4 h-4" />
                   </div>
                   <div>
                     <h4 className="text-[11px] font-black uppercase tracking-wider text-teal-900 dark:text-teal-200">
                       Offline Cache Active
                     </h4>
                     <p className="text-[10px] text-teal-700 dark:text-teal-400 leading-tight">
                       Report templates & safety resources cached for offline protection.
                     </p>
                   </div>
                 </div>
                 <button 
                   onClick={() => setView(AppView.REPORT)}
                   className="bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-sm flex-shrink-0 transition active:scale-95"
                 >
                   Templates
                 </button>
               </div>

               {/* 🚨 Emergency 72-Hour PEP Golden Window Assistant Widget */}
               <div className="mb-4 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white p-4 rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-between">
                 <div className="space-y-1 pr-3">
                   <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-white/20 w-fit px-2.5 py-0.5 rounded-full">
                     <Clock className="w-3 h-3 animate-pulse" /> 72-Hour Medical Golden Window
                   </div>
                   <h3 className="font-black text-sm">Urgent Sexual Assault Care</h3>
                   <p className="text-[11px] text-rose-100 leading-tight">
                     PEP prevents HIV if taken within 72h. Countdown timer, clinical guidance & direct triage line.
                   </p>
                 </div>
                 <button
                   onClick={() => setView(AppView.PEP_EMERGENCY)}
                   className="bg-white text-rose-700 hover:bg-rose-50 text-xs font-black uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-md flex-shrink-0 active:scale-95 transition"
                 >
                   I Need Care
                 </button>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setView(AppView.REPORT)} className="col-span-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white p-6 rounded-2xl shadow-lg shadow-brand-500/30 text-left hover:scale-[1.02] transition-transform active:scale-95">
                   <FilePlus className="w-8 h-8 mb-4 opacity-80" />
                   <h3 className="text-xl font-bold">{t.submit_report}</h3>
                   <p className="text-brand-100 text-sm opacity-90">{t.submit_sub}</p>
                 </button>
                 
                 <button onClick={() => setView(AppView.HUMAN_CHAT)} className="col-span-2 bg-pink-50 dark:bg-pink-900/10 border-2 border-brand-200 dark:border-brand-800 p-6 rounded-2xl text-left hover:bg-pink-100 transition-colors active:scale-95 flex items-center gap-4">
                    <div className="bg-brand-600 p-3 rounded-full text-white shadow-md shadow-brand-500/20">
                       <MessageCircleHeart className="w-8 h-8" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-brand-700 dark:text-brand-400">Live Advocate</h3>
                       <p className="text-sm text-brand-600/80 font-bold">Confidential real-time chat</p>
                    </div>
                 </button>

                 <button onClick={() => setView(AppView.TRACK)} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-left hover:shadow-md transition-shadow active:scale-95">
                   <UserCircle className="w-6 h-6 mb-3 text-purple-500" />
                   <h3 className="font-bold dark:text-white">{t.track_case}</h3>
                   <p className="text-xs text-gray-500 mt-1">{t.track_sub}</p>
                 </button>
                 <button onClick={() => setView(AppView.SAFETY_PLAN)} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-left hover:shadow-md transition-shadow active:scale-95">
                   <Shield className="w-6 h-6 mb-3 text-teal-500" />
                   <h3 className="font-bold dark:text-white">{t.safety_plan}</h3>
                   <p className="text-xs text-gray-500 mt-1">{t.safety_sub}</p>
                 </button>
                 <button onClick={() => setView(AppView.EDUCATION)} className="col-span-2 relative overflow-hidden bg-gradient-to-r from-indigo-700 via-purple-700 to-brand-600 text-white p-5 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all text-left group">
                    <div className="absolute top-0 right-0 w-36 h-full opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none">
                      <img 
                        src="/src/assets/images/gbv_camp_protection_1791740538544.jpg" 
                        alt="" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full mb-1">
                          <span>UNHCR • DRC • WHO Standards</span>
                        </div>
                        <h3 className="font-bold text-lg">{t.edu_center}</h3>
                        <p className="text-indigo-200 text-xs">{t.edu_sub}</p>
                      </div>
                      <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2"><GraduationCap className="w-5 h-5" /></div>
                    </div>
                 </button>
               </div>
            </div>
          )}

          {view === AppView.REPORT && <ReportView onReportSubmitted={handleReportSubmitted} lang={lang} />}
          {view === AppView.TRACK && <TrackView initialCode={lastTrackingCode} />}
          {view === AppView.EDUCATION && <EducationView />}
          {view === AppView.HOTLINES && <HotlinesView />}
          {view === AppView.SAFETY_PLAN && <SafetyPlanView lang={lang} />}
          {view === AppView.PEP_EMERGENCY && (
            <PepEmergencyAssistant 
              onBack={() => setView(AppView.HOME)} 
              onNavigateToCentres={() => setView(AppView.HOTLINES)} 
            />
          )}
          {view === AppView.HUMAN_CHAT && <HumanChatView lang={lang} onClose={() => setView(AppView.HOME)} />}
          {view === AppView.ADMIN_LOGIN && <AdminLogin onLoginSuccess={() => setView(AppView.ADMIN_DASHBOARD)} onBack={() => setView(AppView.HOME)} />}
          {view === AppView.ADMIN_DASHBOARD && <AdminDashboard onLogout={() => setView(AppView.HOME)} />}
        </main>

        {/* Discreet Stealth Safety Settings Modal */}
        {showSafetySettings && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">Discreet Safety Controls</h3>
                    <p className="text-[10px] text-gray-400">Survivor privacy & device security</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSafetySettings(false)}
                  className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Stealth Auto-Clear Switch */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/60 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Stealth Auto-Clear on Exit
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      Wipes local search history, draft inputs, and cached incident notes when Quick Exit is clicked or when minimizing the app.
                    </p>
                  </div>
                  <button
                    onClick={toggleStealthAutoClear}
                    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 mt-1 ${
                      stealthAutoClear ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                      stealthAutoClear ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Camouflage Mode Shortcut */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/60 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-indigo-600" /> Camouflage Calculator Skin
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Turns app into working calculator. Unlock: 1195=</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowSafetySettings(false);
                      setView(AppView.CAMOUFLAGE);
                    }}
                    className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl flex-shrink-0 shadow-sm"
                  >
                    Enter Skin
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowSafetySettings(false)}
                className="w-full py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {view !== AppView.ADMIN_LOGIN && view !== AppView.ADMIN_DASHBOARD && view !== AppView.HUMAN_CHAT && (
          <nav className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around px-2 pb-safe absolute bottom-0 w-full z-10">
            <NavButton target={AppView.HOME} icon={<Home className="w-6 h-6" />} label={t.nav_home} />
            <NavButton target={AppView.TRACK} icon={<UserCircle className="w-6 h-6" />} label={t.nav_track} />
            <NavButton target={AppView.EDUCATION} icon={<GraduationCap className="w-6 h-6" />} label={t.nav_edu} />
            <NavButton target={AppView.HOTLINES} icon={<Phone className="w-6 h-6" />} label={t.nav_help} />
          </nav>
        )}
      </div>
    </div>
  );
};

export default App;
