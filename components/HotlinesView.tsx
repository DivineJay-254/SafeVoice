
import { Phone, MapPin, ExternalLink, Navigation, Loader2, Map as MapIcon, Compass, Crosshair, ArrowRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Hotline, SupportCentre } from '../types';
import { DatabaseService } from '../services/databaseService';
import { GeminiService } from '../services/geminiService';

export const HotlinesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hotlines' | 'centres'>('hotlines');
  const [hotlines, setHotlines] = useState<Hotline[]>([]);
  const [centres, setCentres] = useState<SupportCentre[]>([]);
  const [loadingCentres, setLoadingCentres] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState('');
  const [isOnlineSearch, setIsOnlineSearch] = useState(false);

  useEffect(() => {
    DatabaseService.getHotlines().then(setHotlines);
    DatabaseService.getSupportCentres(0, 0).then(setCentres);
  }, []);

  const handleLocateAndFetch = () => {
    setLoadingCentres(true);
    setLocationError('');
    setIsOnlineSearch(false);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser/device.');
      setLoadingCentres(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        if (navigator.onLine) {
           try {
             const onlineResults = await GeminiService.findNearbyPlaces(latitude, longitude);
             if (onlineResults.length > 0) {
                setCentres(onlineResults);
                setIsOnlineSearch(true);
                setLoadingCentres(false);
                return;
             }
           } catch (e) {
             console.log("Online search failed, sticking to local db");
           }
        }

        const localResults = await DatabaseService.getSupportCentres(latitude, longitude);
        setCentres(localResults);
        setLoadingCentres(false);
      },
      (err) => {
        console.error(err);
        setLocationError('Unable to lock GPS. Please ensure you are outdoors or near a window.');
        setLoadingCentres(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000,           
        maximumAge: 0 
      }
    );
  };

  useEffect(() => {
    if (activeTab === 'centres' && !userLocation) {
      handleLocateAndFetch();
    }
  }, [activeTab]);

  const getNavigationUrl = (centre: SupportCentre) => {
    const baseUrl = "https://www.google.com/maps/dir/?api=1";
    const dest = encodeURIComponent(`${centre.name} ${centre.address}`);
    let url = `${baseUrl}&destination=${dest}&travelmode=walking`;
    
    if (userLocation) {
      url += `&origin=${userLocation.lat},${userLocation.lng}`;
    }
    
    return url;
  };

  return (
    <div className="p-4 pb-20 animate-slide-up h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-6 text-brand-700 dark:text-brand-400">Help & Support</h1>

      <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-xl mb-6 shadow-inner">
        <button 
          onClick={() => setActiveTab('hotlines')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'hotlines' ? 'bg-white dark:bg-gray-700 text-brand-600 shadow-sm' : 'text-gray-500'
          }`}
        >
          Hotlines
        </button>
        <button 
          onClick={() => setActiveTab('centres')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'centres' ? 'bg-white dark:bg-gray-700 text-brand-600 shadow-sm' : 'text-gray-500'
          }`}
        >
          Find Shelters
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
        {activeTab === 'hotlines' ? (
          hotlines.map(hotline => (
            <div key={hotline.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group active:bg-gray-50 transition-colors">
              <div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                  hotline.category === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {hotline.category}
                </span>
                <h3 className="font-bold text-lg mt-1 group-active:text-brand-600">{hotline.number}</h3>
                <p className="text-sm text-gray-500 font-medium">{hotline.name}</p>
              </div>
              <a href={`tel:${hotline.number}`} className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-2xl shadow-lg shadow-green-500/20 transition-transform active:scale-90">
                <Phone className="w-5 h-5 fill-current" />
              </a>
            </div>
          ))
        ) : (
          <>
            <div className="w-full h-56 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4 relative overflow-hidden shadow-inner border border-gray-300 dark:border-gray-600">
               {userLocation && navigator.onLine ? (
                 <iframe 
                   width="100%" 
                   height="100%" 
                   frameBorder="0" 
                   style={{ border: 0 }}
                   src={`https://maps.google.com/maps?q=${userLocation.lat},${userLocation.lng}&z=14&output=embed`}
                   allowFullScreen
                   title="User Location Map"
                 ></iframe>
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center flex-col text-gray-400 bg-gray-100 dark:bg-gray-800 p-6 text-center">
                    {loadingCentres ? (
                       <div className="flex flex-col items-center">
                          <Loader2 className="w-10 h-10 mb-2 animate-spin text-brand-500" />
                          <p className="text-xs font-bold text-brand-600 uppercase tracking-tighter">Locating you...</p>
                       </div>
                    ) : (
                       <MapIcon className="w-12 h-12 mb-2 opacity-20" />
                    )}
                    <span className="text-[10px] mt-2 font-bold leading-tight uppercase tracking-widest text-gray-400">
                      {loadingCentres 
                        ? 'Pinpointing your location precisely...' 
                        : (userLocation ? 'Map needs internet' : 'GPS required for navigation')
                      }
                    </span>
                 </div>
               )}
            </div>
            
            <div className="flex justify-between items-center mb-2 px-1">
               <div className="flex items-center gap-2">
                 <h3 className="font-black text-xs uppercase tracking-widest text-gray-400">Nearby Support</h3>
                 {isOnlineSearch && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-black flex items-center gap-1 uppercase tracking-tighter"><Compass className="w-3 h-3"/> Active GPS</span>}
               </div>
               <button 
                 onClick={handleLocateAndFetch} 
                 disabled={loadingCentres}
                 className={`text-[10px] text-brand-600 flex items-center bg-brand-50 dark:bg-brand-900/20 px-3 py-2 rounded-lg font-black uppercase tracking-tighter border border-brand-100 ${loadingCentres ? 'opacity-50' : 'active:scale-95'}`}
               >
                 <Crosshair className="w-3 h-3 mr-1" /> {loadingCentres ? 'Searching...' : 'Refresh'}
               </button>
            </div>

            {locationError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-[10px] font-bold border border-red-100 mb-4">{locationError}</div>
            )}

            <div className="space-y-4">
              {centres.map((centre, idx) => (
                <div key={centre.id || idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in hover:shadow-lg transition-shadow">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{centre.name}</h3>
                      <span className={`text-[10px] text-white px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                          centre.type === 'Police' ? 'bg-blue-600' : 
                          centre.type === 'Medical' ? 'bg-red-500' : 'bg-brand-500'
                      }`}>
                        {centre.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mb-3 flex items-center gap-1"><MapPin className="w-3 h-3" /> {centre.address}</p>
                    
                    <a 
                      href={getNavigationUrl(centre)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all"
                    >
                      <Navigation className="w-5 h-5 fill-current" />
                      <div className="text-left">
                        <p className="text-xs uppercase font-black leading-none mb-0.5">Start Navigation</p>
                        <p className="text-[10px] font-medium opacity-80 leading-none">Walking mode active</p>
                      </div>
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
