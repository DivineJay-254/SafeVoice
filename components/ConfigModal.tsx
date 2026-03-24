
import React, { useState, useEffect } from 'react';
import { BackendService } from '../services/mockBackend';
import { AppwriteConfig } from '../types';
import { Save, Server, Loader2, X, AlertTriangle, CheckCircle, HelpCircle, TableProperties, Globe, Info } from 'lucide-react';

export const ConfigModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [config, setConfig] = useState<AppwriteConfig>({
    url: '',
    key: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'error' | 'success' | null, msg: string}>({ type: null, msg: '' });

  useEffect(() => {
    setConfig(BackendService.getConfig());
  }, []);

  const handleTest = async () => {
    setLoading(true);
    setStatus({ type: null, msg: '' });
    BackendService.saveConfig(config);
    
    try {
        const res = await BackendService.checkConnection();
        if (res.success) {
            setStatus({ type: 'success', msg: 'Connected to Supabase!' });
        } else {
            setStatus({ type: 'error', msg: res.message || 'Connection Failed' });
        }
    } catch (e: any) {
        setStatus({ type: 'error', msg: e.message });
    } finally {
        setLoading(false);
    }
  };

  const handleSave = () => {
    BackendService.saveConfig(config);
    onClose();
    window.location.reload(); 
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                <h3 className="font-bold">Supabase Configuration</h3>
            </div>
            <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Error Feedback Area */}
            {status.msg && (
                <div className={`p-4 rounded-xl text-sm border flex flex-col gap-2 ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    <div className="flex items-center gap-2 font-bold">
                        {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        {status.type === 'success' ? 'Success' : 'Connection Error'}
                    </div>
                    <div className="break-words">{status.msg}</div>
                </div>
            )}

            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800 mb-2 flex gap-3 items-start">
                <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-green-700 dark:text-green-300">
                    Your Supabase credentials are secure and stored locally on your device.
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Supabase URL</label>
                <input 
                    type="text" 
                    value={config.url}
                    onChange={e => setConfig({...config, url: e.target.value})}
                    placeholder="https://xyz.supabase.co"
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-mono"
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Anon Key</label>
                <input 
                    type="text" 
                    value={config.key}
                    onChange={e => setConfig({...config, key: e.target.value})}
                    placeholder="eyJh..."
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-mono"
                />
            </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-3 flex-shrink-0">
             <button 
               onClick={handleTest}
               disabled={loading}
               className="flex-1 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex justify-center items-center gap-2"
             >
               {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Test Connection'}
             </button>
             <button 
               onClick={handleSave}
               className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 flex justify-center items-center gap-2"
             >
               <Save className="w-4 h-4" /> Save & Reload
             </button>
        </div>

      </div>
    </div>
  );
};
