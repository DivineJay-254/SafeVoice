import React, { useState, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';
import { Shield, Lock, ChevronRight, Loader2, Save, Phone } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../services/translations';

interface SafetyPlanViewProps {
  lang: Language;
}

export const SafetyPlanView: React.FC<SafetyPlanViewProps> = ({ lang }) => {
  const t = getTranslation(lang);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string>('');
  
  // SOS Contact State
  const [sosContact, setSosContact] = useState('');
  const [contactSaved, setContactSaved] = useState(false);
  
  const [formData, setFormData] = useState({
    livingSituation: 'Living with abuser',
    hasChildren: false,
    accessToMoney: 'No access',
    trustedContact: false
  });

  useEffect(() => {
    const saved = localStorage.getItem('safevoice_sos_contact');
    if (saved) setSosContact(saved);
  }, []);

  const handleSaveContact = () => {
    localStorage.setItem('safevoice_sos_contact', sosContact);
    setContactSaved(true);
    setTimeout(() => setContactSaved(false), 2000);
  };

  const handleGenerate = async () => {
    setLoading(true);
    const result = await GeminiService.generateSafetyPlan(formData);
    setPlan(result);
    setLoading(false);
    setStep(2);
  };

  if (step === 1) {
    return (
      <div className="p-4 pb-20 animate-slide-up">
        {/* Intro */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl mb-6 flex items-start gap-3 border border-indigo-100 dark:border-indigo-800">
           <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
           <div>
             <h2 className="font-bold text-indigo-800 dark:text-indigo-300">{t.plan_title}</h2>
             <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
               {t.plan_intro}
             </p>
           </div>
        </div>

        {/* SOS Contact Setup */}
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
           <div className="flex items-center gap-2 mb-2">
             <Phone className="w-5 h-5 text-red-600" />
             <h3 className="font-bold text-red-700 dark:text-red-400">{t.sos_setup}</h3>
           </div>
           <p className="text-sm text-red-600/80 mb-3">{t.sos_desc}</p>
           <div className="flex gap-2">
             <input 
               type="tel" 
               placeholder="e.g. +2547..."
               value={sosContact}
               onChange={(e) => setSosContact(e.target.value)}
               className="flex-1 p-2 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 outline-none"
             />
             <button 
               onClick={handleSaveContact}
               className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                 contactSaved ? 'bg-green-600 text-white' : 'bg-red-600 text-white hover:bg-red-700'
               }`}
             >
               {contactSaved ? 'Saved' : t.save_contact}
             </button>
           </div>
        </div>

        {/* Questionnaire */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Living Situation</label>
            <select 
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none"
              value={formData.livingSituation}
              onChange={(e) => setFormData({...formData, livingSituation: e.target.value})}
            >
              <option value="Living with abuser">I live with the person hurting me</option>
              <option value="Not living together">We do not live together</option>
              <option value="Planning to leave">I am planning to leave soon</option>
            </select>
          </div>

          <div>
             <label className="block text-sm font-medium mb-2">Do you have children involved?</label>
             <div className="flex gap-4">
               <button 
                 onClick={() => setFormData({...formData, hasChildren: true})}
                 className={`flex-1 p-3 rounded-xl border transition-all ${formData.hasChildren ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'}`}
               >
                 Yes
               </button>
               <button 
                 onClick={() => setFormData({...formData, hasChildren: false})}
                 className={`flex-1 p-3 rounded-xl border transition-all ${!formData.hasChildren ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'}`}
               >
                 No
               </button>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Financial Situation</label>
            <select 
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none"
              value={formData.accessToMoney}
              onChange={(e) => setFormData({...formData, accessToMoney: e.target.value})}
            >
              <option value="No access">I have no access to money</option>
              <option value="Shared accounts">Only shared accounts</option>
              <option value="Personal savings">I have my own money</option>
            </select>
          </div>

          <div>
             <label className="block text-sm font-medium mb-2">Do you have a trusted friend/neighbor?</label>
             <div className="flex gap-4">
               <button 
                 onClick={() => setFormData({...formData, trustedContact: true})}
                 className={`flex-1 p-3 rounded-xl border transition-all ${formData.trustedContact ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'}`}
               >
                 Yes
               </button>
               <button 
                 onClick={() => setFormData({...formData, trustedContact: false})}
                 className={`flex-1 p-3 rounded-xl border transition-all ${!formData.trustedContact ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'}`}
               >
                 No
               </button>
             </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-bold shadow-lg flex justify-center items-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <>
                Generate Plan <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
          
          <p className="text-xs text-center text-gray-400 mt-2">
            This information is processed anonymously by AI and is not saved on our servers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 animate-slide-up bg-white dark:bg-gray-900 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Safety Plan</h1>
        <button 
          onClick={() => setStep(1)}
          className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Reset
        </button>
      </div>

      <div className="prose dark:prose-invert max-w-none text-sm bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 whitespace-pre-line leading-relaxed">
        {plan}
      </div>

      <div className="mt-6 flex gap-3">
         <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-xl flex gap-3 items-center w-full">
            <Lock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-xs text-yellow-700 dark:text-yellow-500">
              For your safety, this plan is not saved. Take a screenshot only if it is safe to do so.
            </p>
         </div>
      </div>
    </div>
  );
};
