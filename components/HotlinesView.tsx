import React, { useState, useEffect } from 'react';
import { Hotline, SupportCentre } from '../types';
import { BackendService } from '../services/mockBackend';
import { Phone, MapPin, ExternalLink, Navigation } from 'lucide-react';

export const HotlinesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hotlines' | 'centres'>('hotlines');
  const [hotlines, setHotlines] = useState<Hotline[]>([]);
  const [centres, setCentres] = useState<SupportCentre[]>([]);

  useEffect(() => {
    BackendService.getHotlines().then(setHotlines);
    BackendService.getSupportCentres(0, 0).then(setCentres);
  }, []);

  return (
    <div className="p-4 pb-20 animate-slide-up h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-6 text-brand-700 dark:text-brand-400">Help & Support</h1>

      <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-xl mb-6">
        <button 
          onClick={() => setActiveTab('hotlines')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'hotlines' ? 'bg-white dark:bg-gray-700 text-brand-600 shadow-sm' : 'text-gray-500'
          }`}
        >
          Hotlines
        </button>
        <button 
          onClick={() => setActiveTab('centres')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'centres' ? 'bg-white dark:bg-gray-700 text-brand-600 shadow-sm' : 'text-gray-500'
          }`}
        >
          Centres
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
        {activeTab === 'hotlines' ? (
          hotlines.map(hotline => (
            <div key={hotline.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  hotline.category === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {hotline.category}
                </span>
                <h3 className="font-bold text-lg mt-1">{hotline.number}</h3>
                <p className="text-sm text-gray-500">{hotline.name}</p>
              </div>
              <a href={`tel:${hotline.number}`} className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-transform active:scale-90">
                <Phone className="w-5 h-5" />
              </a>
            </div>
          ))
        ) : (
          <>
            {/* Map Placeholder */}
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4 relative overflow-hidden group">
               <div className="absolute inset-0 flex items-center justify-center flex-col text-gray-400">
                  <MapPin className="w-8 h-8 mb-2" />
                  <span className="text-xs">Google Maps Integration</span>
               </div>
               <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
               <img 
                  src="https://picsum.photos/seed/map/600/300" 
                  alt="Map Placeholder" 
                  className="w-full h-full object-cover opacity-30 mix-blend-overlay"
               />
            </div>

            {centres.map(centre => (
              <div key={centre.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{centre.name}</h3>
                  <span className="text-xs text-gray-500 flex items-center">
                    <Navigation className="w-3 h-3 mr-1" /> {centre.distance}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{centre.address}</p>
                <div className="flex gap-2">
                   <button className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600">
                     View Details
                   </button>
                   <button className="flex-1 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                     Directions <ExternalLink className="w-3 h-3" />
                   </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
