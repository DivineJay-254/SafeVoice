
import React, { useState } from 'react';
import { BackendService } from '../services/mockBackend';
import { Loader2, Lock, ArrowLeft, Cloud, ShieldCheck, User } from 'lucide-react';

export const AdminLogin: React.FC<{ onLoginSuccess: () => void, onBack: () => void }> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seeding, setSeeding] = useState(false);
  
  const DEMO_ACCOUNTS = [
    { label: 'Admin', email: 'admin@safevoice.org' },
    { label: 'Manager', email: 'manager@safevoice.org' },
    { label: 'Supervisor', email: 'supervisor@safevoice.org' },
    { label: 'Director', email: 'director@safevoice.org' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // LOGIN FLOW
      const success = await BackendService.adminLogin(email, password);
      if (success) {
        onLoginSuccess();
      } else {
        setError("Authentication failed. Check credentials.");
      }
    } catch (e) {
      setError("Operation failed. Ensure you are connected to the network.");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedAdmins = async () => {
    setSeeding(true);
    try {
        const result = await BackendService.seedAdmins();
        alert(result.message);
    } catch(e) {
        alert("Failed to seed admins.");
    } finally {
        setSeeding(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
      setEmail(demoEmail);
      setPassword('password123');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-fade-in bg-gray-50 dark:bg-gray-900 relative">
      <button onClick={onBack} className="absolute top-6 left-6 flex items-center text-gray-500 hover:text-gray-800 dark:hover:text-white">
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to App
      </button>

      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center text-brand-600 mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Access</h1>
          <div className="flex items-center gap-1 mt-2 text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded-full">
             <ShieldCheck className="w-3 h-3" />
             <span>SafeVoice Central Connected</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@safevoice.org"
              className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all text-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all text-lg"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-red-500 text-base font-medium text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-900">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-xl font-bold text-lg shadow-lg hover:opacity-90 transition-opacity flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Sign In'}
          </button>
        </form>
        
        {/* Quick Fill Demo Accounts */}
        <div className="mt-6">
            <p className="text-[10px] text-gray-400 text-center uppercase font-bold mb-3">Quick Fill Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map(acc => (
                    <button
                        key={acc.label}
                        type="button"
                        onClick={() => fillDemo(acc.email)}
                        className="p-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
                    >
                        <User className="w-3 h-3" /> {acc.label}
                    </button>
                ))}
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2 italic">Password: password123</p>
        </div>
      </div>
    </div>
  );
};
