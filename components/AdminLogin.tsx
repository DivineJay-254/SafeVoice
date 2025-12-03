import React, { useState } from 'react';
import { BackendService } from '../services/mockBackend';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';

export const AdminLogin: React.FC<{ onLoginSuccess: () => void, onBack: () => void }> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('admin@safevoice.org');
  const [password, setPassword] = useState(''); // Correct is 'admin123'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const success = await BackendService.adminLogin(email, password);
      if (success) {
        onLoginSuccess();
      } else {
        setError("Invalid credentials.");
      }
    } catch (e) {
      setError("Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-fade-in bg-gray-50 dark:bg-gray-900">
      <button onClick={onBack} className="absolute top-6 left-6 flex items-center text-gray-500 hover:text-gray-800 dark:hover:text-white">
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to App
      </button>

      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-600 mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Portal</h1>
          <p className="text-gray-500 text-sm">Sign in to manage cases</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 outline-none focus:border-brand-500 transition-colors"
            />
            <p className="text-xs text-gray-400 mt-2">Try: <span className="font-mono">admin123</span></p>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity flex justify-center"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};