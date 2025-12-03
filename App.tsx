import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import { ReportView } from './components/ReportView';
import { TrackView } from './components/TrackView';
import { EducationView } from './components/EducationView';
import { HotlinesView } from './components/HotlinesView';
import { ChatView } from './components/ChatView';
import { SafetyPlanView } from './components/SafetyPlanView';
import { Home, FilePlus, BookOpen, Phone, Bell, Moon, Sun, UserCircle, MessageCircleHeart, Shield, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [darkMode, setDarkMode] = useState(false);
  const [lastTrackingCode, setLastTrackingCode] = useState<string>('');
  const [notifications, setNotifications] = useState<string[]>([]);

  // Initialize Dark Mode based on system preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Apply Dark Mode class to HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Simulate Push Notifications
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(prev => [...prev, "New education module available: 'Digital Safety'"]);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // --- QUICK EXIT FUNCTION ---
  const handleQuickExit = () => {
    // Redirect to a harmless site immediately
    window.location.href = "https://www.google.com/search?q=weather+today";
  };

  const handleReportSubmitted = (code: string) => {
    setLastTrackingCode(code);
    setView(AppView.TRACK);
    setNotifications(prev => [...prev, `Report submitted. Tracking code: ${code}`]);
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

  return (
    <div className="flex justify-center min-h-screen bg-gray-200 dark:bg-black">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-white dark:bg-gray-900 h-[100dvh] relative shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <header className="px-4 py-3 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              SV
            </div>
            <h1 className="font-bold text-lg tracking-tight text-gray-800 dark:text-white hidden sm:block">SafeVoice</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Quick Exit (Moved here and smaller) */}
            <button 
              onClick={handleQuickExit}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-sm transition-transform active:scale-95"
              title="Quick Exit"
            >
              <LogOut className="w-3 h-3 mr-1" /> Exit
            </button>

            <button onClick={() => setDarkMode(!darkMode)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
            <div className="relative">
               <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
               {notifications.length > 0 && (
                 <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
               )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative">
          
          {/* Notification Toast */}
          {notifications.length > 0 && (
            <div className="absolute top-4 left-4 right-4 bg-gray-800 text-white text-sm p-3 rounded-lg shadow-lg z-30 animate-slide-up flex justify-between items-center opacity-90">
               <span>{notifications[notifications.length - 1]}</span>
               <button onClick={() => setNotifications([])} className="text-xs text-gray-400 ml-2">Dismiss</button>
            </div>
          )}

          {view === AppView.HOME && (
            <div className="p-6 animate-fade-in pb-20">
               <div className="mb-8">
                 <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Hello,</h2>
                 <p className="text-gray-500 dark:text-gray-400">You are safe here. How can we help today?</p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => setView(AppView.REPORT)}
                   className="col-span-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white p-6 rounded-2xl shadow-lg shadow-brand-500/30 text-left hover:scale-[1.02] transition-transform active:scale-95"
                 >
                   <FilePlus className="w-8 h-8 mb-4 opacity-80" />
                   <h3 className="text-xl font-bold">Submit Report</h3>
                   <p className="text-brand-100 text-sm opacity-90">Anonymously report an incident</p>
                 </button>

                 <button 
                   onClick={() => setView(AppView.TRACK)}
                   className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-left hover:shadow-md transition-shadow active:scale-95"
                 >
                   <UserCircle className="w-6 h-6 mb-3 text-purple-500" />
                   <h3 className="font-bold dark:text-white">Track Case</h3>
                   <p className="text-xs text-gray-500 mt-1">Check status updates</p>
                 </button>

                 <button 
                   onClick={() => setView(AppView.SAFETY_PLAN)}
                   className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-left hover:shadow-md transition-shadow active:scale-95"
                 >
                   <Shield className="w-6 h-6 mb-3 text-teal-500" />
                   <h3 className="font-bold dark:text-white">Safety Plan</h3>
                   <p className="text-xs text-gray-500 mt-1">AI Exit Strategy</p>
                 </button>

                 <button 
                   onClick={() => setView(AppView.CHAT)}
                   className="col-span-2 bg-indigo-600 text-white p-5 rounded-2xl shadow-lg flex items-center justify-between hover:bg-indigo-700 active:scale-95 transition-all"
                 >
                    <div>
                      <h3 className="font-bold text-lg">Safe Chat AI</h3>
                      <p className="text-indigo-200 text-xs">24/7 Anonymous Support</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <MessageCircleHeart className="w-5 h-5" />
                    </div>
                 </button>
               </div>
            </div>
          )}

          {view === AppView.REPORT && <ReportView onReportSubmitted={handleReportSubmitted} />}
          {view === AppView.TRACK && <TrackView initialCode={lastTrackingCode} />}
          {view === AppView.EDUCATION && <EducationView />}
          {view === AppView.HOTLINES && <HotlinesView />}
          {view === AppView.CHAT && <ChatView />}
          {view === AppView.SAFETY_PLAN && <SafetyPlanView />}

        </main>

        {/* Bottom Navigation */}
        <nav className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around px-2 pb-safe absolute bottom-0 w-full z-10">
          <NavButton target={AppView.HOME} icon={<Home className="w-6 h-6" />} label="Home" />
          <NavButton target={AppView.TRACK} icon={<UserCircle className="w-6 h-6" />} label="Track" />
          <NavButton target={AppView.CHAT} icon={<MessageCircleHeart className="w-6 h-6" />} label="Chat" />
          <NavButton target={AppView.HOTLINES} icon={<Phone className="w-6 h-6" />} label="Help" />
        </nav>
      </div>
    </div>
  );
};

export default App;