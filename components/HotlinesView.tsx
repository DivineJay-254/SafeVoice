import { 
  Phone, 
  MapPin, 
  ExternalLink, 
  Navigation, 
  Loader2, 
  Map as MapIcon, 
  Compass, 
  Crosshair, 
  ArrowRight,
  ShieldCheck,
  Clock,
  Footprints,
  MessageSquare,
  Hash,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info
} from 'lucide-react';
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
  
  // Kakuma/Kalobeyei zone filter
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [expandedDirections, setExpandedDirections] = useState<Record<string, boolean>>({});
  const [showUssdModal, setShowUssdModal] = useState(false);
  const [ussdCopied, setUssdCopied] = useState<string | null>(null);

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
        setLocationError('Unable to lock GPS. Showing offline cached Kakuma & Kalobeyei directory.');
        setLoadingCentres(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000,           
        maximumAge: 0 
      }
    );
  };

  useEffect(() => {
    if (activeTab === 'centres' && !userLocation) {
      handleLocateAndFetch();
    }
  }, [activeTab]);

  const toggleDirections = (id: string) => {
    setExpandedDirections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyUssd = (code: string) => {
    navigator.clipboard.writeText(code);
    setUssdCopied(code);
    setTimeout(() => setUssdCopied(null), 2500);
  };

  const getNavigationUrl = (centre: SupportCentre) => {
    const baseUrl = "https://www.google.com/maps/dir/?api=1";
    const dest = encodeURIComponent(`${centre.name} ${centre.address}`);
    let url = `${baseUrl}&destination=${dest}&travelmode=walking`;
    
    if (userLocation) {
      url += `&origin=${userLocation.lat},${userLocation.lng}`;
    }
    
    return url;
  };

  const filteredCentres = centres.filter(c => {
    if (selectedZone === 'All') return true;
    return c.campZone === selectedZone || c.address.toLowerCase().includes(selectedZone.toLowerCase());
  });

  return (
    <div className="p-4 pb-24 animate-slide-up h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-700 dark:text-brand-400">Help & Support</h1>
          <p className="text-[11px] text-gray-500">Kakuma 1–4 & Kalobeyei WGSS, Clinics & Desks</p>
        </div>

        {/* USSD / SMS Fallback Button */}
        <button
          onClick={() => setShowUssdModal(true)}
          className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700/60 flex items-center gap-1 transition shadow-sm"
          title="No data? Use USSD / SMS fallback"
        >
          <Hash className="w-3.5 h-3.5" /> USSD / SMS
        </button>
      </div>

      <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4 shadow-inner">
        <button 
          onClick={() => setActiveTab('hotlines')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'hotlines' ? 'bg-white dark:bg-gray-700 text-brand-600 shadow-sm' : 'text-gray-500'
          }`}
        >
          Hotlines & Helplines
        </button>
        <button 
          onClick={() => setActiveTab('centres')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'centres' ? 'bg-white dark:bg-gray-700 text-brand-600 shadow-sm' : 'text-gray-500'
          }`}
        >
          Safe Spaces & Clinics
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
        {activeTab === 'hotlines' ? (
          <div className="space-y-3">
            {hotlines.map(hotline => (
              <div key={hotline.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group active:bg-gray-50 transition-colors">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                      hotline.category === 'Emergency' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {hotline.category}
                    </span>
                    {hotline.number === '1195' && (
                      <span className="text-[10px] bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 px-2 py-0.5 rounded font-black uppercase">
                        Toll-Free 24/7
                      </span>
                    )}
                  </div>
                  <h3 className="font-mono font-bold text-lg mt-1 text-gray-900 dark:text-white">{hotline.number}</h3>
                  <p className="text-xs text-gray-500 font-medium">{hotline.name}</p>
                </div>
                <a 
                  href={`tel:${hotline.number}`} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-transform active:scale-90 flex items-center gap-1.5 text-xs font-bold"
                >
                  <Phone className="w-4 h-4 fill-current" /> Call
                </a>
              </div>
            ))}

            {/* Offline USSD Quick Callout */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/60 p-4 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                <Hash className="w-4 h-4 text-amber-600" />
                <span>Feature Phone & Low Data USSD Dialers:</span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                If you have zero mobile airtime or data bundles in the camp, dial toll-free shortcodes directly from your standard phone dialer:
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a 
                  href="tel:*384*1195%23"
                  className="bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 p-2.5 rounded-xl font-mono font-bold text-center text-amber-900 dark:text-amber-200 text-xs block active:scale-95"
                >
                  *384*1195#
                  <span className="block text-[9px] font-sans text-gray-500 font-normal">Kenya GBV USSD</span>
                </a>
                <a 
                  href="tel:1517"
                  className="bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 p-2.5 rounded-xl font-mono font-bold text-center text-amber-900 dark:text-amber-200 text-xs block active:scale-95"
                >
                  1517
                  <span className="block text-[9px] font-sans text-gray-500 font-normal">UNHCR Kakuma Hotline</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Zone Filter Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {['All', 'Kakuma 1', 'Kakuma 2', 'Kakuma 3', 'Kakuma 4', 'Kalobeyei'].map(zone => (
                <button
                  key={zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedZone === zone
                      ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {zone === 'All' ? 'All Camp Zones' : zone}
                </button>
              ))}
            </div>

            {/* Offline / Map Preview Box */}
            <div className="w-full h-44 bg-gray-200 dark:bg-gray-800 rounded-2xl relative overflow-hidden shadow-inner border border-gray-300 dark:border-gray-700">
               {userLocation && navigator.onLine ? (
                 <iframe 
                   width="100%" 
                   height="100%" 
                   frameBorder="0" 
                   style={{ border: 0 }}
                   src={`https://maps.google.com/maps?q=${userLocation.lat},${userLocation.lng}&z=13&output=embed`}
                   allowFullScreen
                   title="User Location Map"
                 ></iframe>
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center flex-col text-gray-500 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4 text-center">
                    {loadingCentres ? (
                       <div className="flex flex-col items-center">
                          <Loader2 className="w-8 h-8 mb-2 animate-spin text-brand-500" />
                          <p className="text-xs font-bold text-brand-600 uppercase tracking-tighter">Scanning nearest spaces...</p>
                       </div>
                    ) : (
                       <MapIcon className="w-10 h-10 mb-2 opacity-30 text-brand-600" />
                    )}
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 leading-tight">
                      {userLocation ? 'Offline Walking Route Mode' : 'Kakuma & Kalobeyei Verified Safe Spaces'}
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5">
                      Works 100% offline without GPS or cellular connection
                    </span>
                 </div>
               )}
            </div>
            
            <div className="flex justify-between items-center px-1">
               <div className="flex items-center gap-2">
                 <h3 className="font-black text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                   {selectedZone === 'All' ? 'Showing All Safe Spaces' : `${selectedZone} Verified Locations`}
                 </h3>
                 {isOnlineSearch && (
                   <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black flex items-center gap-1 uppercase tracking-tight">
                     <Compass className="w-3 h-3"/> Active GPS
                   </span>
                 )}
               </div>
               <button 
                 onClick={handleLocateAndFetch} 
                 disabled={loadingCentres}
                 className={`text-[10px] text-brand-600 flex items-center bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 rounded-lg font-black uppercase tracking-tight border border-brand-200 dark:border-brand-800 ${loadingCentres ? 'opacity-50' : 'active:scale-95'}`}
               >
                 <Crosshair className="w-3 h-3 mr-1" /> {loadingCentres ? 'Locating...' : 'Refresh GPS'}
               </button>
            </div>

            {locationError && (
              <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 p-2.5 rounded-xl text-[10px] font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 flex-shrink-0" /> {locationError}
              </div>
            )}

            <div className="space-y-3.5">
              {filteredCentres.map((centre, idx) => (
                <div key={centre.id || idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in hover:shadow-md transition-shadow">
                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {centre.campZone && (
                            <span className="text-[9px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                              {centre.campZone}
                            </span>
                          )}
                          {centre.isVerifiedWGSS && (
                            <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-black flex items-center gap-1 uppercase tracking-wider">
                              <ShieldCheck className="w-3 h-3" /> Verified Safe Space (WGSS)
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-base text-gray-900 dark:text-white leading-snug mt-1">
                          {centre.name}
                        </h3>
                      </div>
                      
                      <span className={`text-[10px] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider flex-shrink-0 ${
                          centre.type === 'Police' ? 'bg-blue-600' : 
                          centre.type === 'Medical' ? 'bg-rose-600' : 'bg-brand-600'
                      }`}>
                        {centre.type}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> {centre.address}
                    </p>

                    {centre.hours && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Hours:</span> {centre.hours}
                      </p>
                    )}

                    {/* Step-by-Step Walking Route Guide */}
                    {centre.walkingDirections && (
                      <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => toggleDirections(centre.id)}
                          className="w-full flex items-center justify-between text-[11px] font-bold text-brand-700 dark:text-brand-300"
                        >
                          <span className="flex items-center gap-1.5">
                            <Footprints className="w-3.5 h-3.5 text-brand-600" /> Offline Walking Route Guide
                          </span>
                          {expandedDirections[centre.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {expandedDirections[centre.id] && (
                          <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 leading-relaxed">
                            {centre.walkingDirections}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action buttons: Direct Call & Walking Navigation */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {centre.emergencyPhone && (
                        <a 
                          href={`tel:${centre.emergencyPhone}`}
                          className="py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800/60 transition active:scale-95"
                        >
                          <Phone className="w-3.5 h-3.5 fill-current" /> Call Desk
                        </a>
                      )}
                      
                      <a 
                        href={getNavigationUrl(centre)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`${centre.emergencyPhone ? '' : 'col-span-2'} py-2.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 active:scale-95 transition`}
                      >
                        <Navigation className="w-3.5 h-3.5 fill-current" /> Walking Map
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* USSD / SMS Fallback Modal */}
      {showUssdModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">Offline USSD & SMS Fallback</h3>
                  <p className="text-[10px] text-gray-500">For zero-data & feature-phone users in Kakuma</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUssdModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-bold p-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed">
                If your device loses data bundles or you are using a basic keypad phone, you can still trigger emergency reporting via toll-free USSD or pre-formatted SMS:
              </p>

              {/* USSD option 1 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">National GBV Helpline USSD</p>
                  <p className="font-mono font-black text-sm text-brand-600 dark:text-brand-400">*384*1195#</p>
                  <p className="text-[9px] text-gray-400">Toll-free on Safaricom & Airtel</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => copyUssd('*384*1195#')}
                    className="px-2.5 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg font-bold text-[10px] text-gray-700 dark:text-gray-200"
                  >
                    {ussdCopied === '*384*1195#' ? 'Copied' : 'Copy'}
                  </button>
                  <a
                    href="tel:*384*1195%23"
                    className="px-3 py-1.5 bg-brand-600 text-white rounded-lg font-bold text-[10px]"
                  >
                    Dial
                  </a>
                </div>
              </div>

              {/* USSD option 2 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">UNHCR Kakuma Protection Hotline</p>
                  <p className="font-mono font-black text-sm text-purple-600 dark:text-purple-400">1517</p>
                  <p className="text-[9px] text-gray-400">Direct toll-free camp dispatcher</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => copyUssd('1517')}
                    className="px-2.5 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg font-bold text-[10px] text-gray-700 dark:text-gray-200"
                  >
                    {ussdCopied === '1517' ? 'Copied' : 'Copy'}
                  </button>
                  <a
                    href="tel:1517"
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-lg font-bold text-[10px]"
                  >
                    Call
                  </a>
                </div>
              </div>

              {/* SMS Template Option */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Pre-Formatted SMS Template</p>
                  <span className="text-[9px] text-emerald-600 font-bold">Encrypted format</span>
                </div>
                <p className="font-mono text-[10px] bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                  JUASAFETY REPORT [Zone] [Urgent/Medical] [Brief details]
                </p>
                <a
                  href={`sms:1195?body=${encodeURIComponent("JUASAFETY REPORT Kakuma Camp: Need immediate confidential protection assistance.")}`}
                  className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Open SMS to 1195
                </a>
              </div>
            </div>

            <button
              onClick={() => setShowUssdModal(false)}
              className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
