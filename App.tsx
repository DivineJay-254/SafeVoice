
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
import { DatabaseService } from './services/databaseService';
import { getTranslation, TRANSLATIONS } from './services/translations';
import { Home, FilePlus, BookOpen, Phone, Bell, Moon, Sun, UserCircle, Shield, LogOut, Globe, WifiOff, Settings, Languages, GraduationCap, MessageCircleHeart } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [lastTrackingCode, setLastTrackingCode] = useState<string>('');
  const [lastKnownStatus, setLastKnownStatus] = useState<string>('');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [logoTaps, setLogoTaps] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const t = getTranslation(lang);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    const history = DatabaseService.getHistory();
    if (history.length > 0) {
        setLastTrackingCode(history[0]);
    }
    DatabaseService.checkConnection().then(result => {
        if (!result.success) {
            setConnectionError(result.message || "Cannot connect to server.");
        }
    });
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleQuickExit = () => {
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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">SV</div>
                <h1 className="font-bold text-lg tracking-tight text-gray-800 dark:text-white hidden sm:block">Juasafety yako</h1>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleQuickExit} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-sm transition-transform active:scale-95">
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
              <div className="bg-red-600 text-white text-xs p-2 text-center flex items-center justify-between font-bold sticky top-0 z-50">
                  <div className="flex items-center gap-2"><WifiOff className="w-4 h-4" /> {connectionError}</div>
              </div>
          )}

          {view === AppView.HOME && (
            <div className="p-6 animate-fade-in pb-20">
               <div className="mb-8">
                 <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t.welcome}</h2>
                 <p className="text-gray-500 dark:text-gray-400">{t.safe_msg}</p>
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
                 <button onClick={() => setView(AppView.EDUCATION)} className="col-span-2 bg-indigo-600 text-white p-5 rounded-2xl shadow-lg flex items-center justify-between hover:bg-indigo-700 active:scale-95 transition-all">
                    <div>
                      <h3 className="font-bold text-lg">{t.edu_center}</h3>
                      <p className="text-indigo-200 text-xs">{t.edu_sub}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full"><GraduationCap className="w-5 h-5" /></div>
                 </button>
               </div>
            </div>
          )}

          {view === AppView.REPORT && <ReportView onReportSubmitted={handleReportSubmitted} lang={lang} />}
          {view === AppView.TRACK && <TrackView initialCode={lastTrackingCode} />}
          {view === AppView.EDUCATION && <EducationView />}
          {view === AppView.HOTLINES && <HotlinesView />}
          {view === AppView.SAFETY_PLAN && <SafetyPlanView lang={lang} />}
          {view === AppView.HUMAN_CHAT && <HumanChatView lang={lang} onClose={() => setView(AppView.HOME)} />}
          {view === AppView.ADMIN_LOGIN && <AdminLogin onLoginSuccess={() => setView(AppView.ADMIN_DASHBOARD)} onBack={() => setView(AppView.HOME)} />}
          {view === AppView.ADMIN_DASHBOARD && <AdminDashboard onLogout={() => setView(AppView.HOME)} />}
        </main>

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
