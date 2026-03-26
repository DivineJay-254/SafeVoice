
import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Loader2, Lock, ArrowLeft, ShieldCheck, LogIn } from 'lucide-react';
import { DatabaseService } from '../services/databaseService';

export const AdminLogin: React.FC<{ onLoginSuccess: () => void, onBack: () => void }> = ({ onLoginSuccess, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      
      // Ensure user document exists (bootstraps if it's the first login)
      await DatabaseService.ensureUserDocument();
      
      // Check if user has admin role
      const role = await DatabaseService.getCurrentUserRole();
      
      if (role === 'admin') {
        const token = await result.user.getIdToken();
        localStorage.setItem('sv_admin_token', token);
        onLoginSuccess();
      } else {
        setError("Access denied. You do not have administrative privileges.");
        await auth.signOut();
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
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
             <span>Juasafety yako Connected</span>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-sm text-gray-500 text-center leading-relaxed">
            Authorized personnel only. Please sign in with your official Google account to access the dashboard.
          </p>

          {error && <p className="text-red-500 text-sm font-medium text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900">{error}</p>}

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-4 rounded-xl font-bold text-lg shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-600 transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : (
              <>
                <LogIn className="w-5 h-5" />
                Sign in with Google
              </>
            )}
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Security Protocol</p>
            <p className="text-[10px] text-gray-400 mt-1">All access attempts are logged and monitored.</p>
        </div>
      </div>
    </div>
  );
};
