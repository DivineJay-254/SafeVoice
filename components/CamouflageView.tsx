import React, { useState, useEffect } from 'react';
import { CloudSun, Sun, Wind, Droplets, ArrowLeft, RefreshCw, KeyRound, Sparkles, CloudRain, Thermometer, ShieldAlert, Check } from 'lucide-react';
import { useDeviceShake } from './useDeviceShake';

interface CamouflageProps {
  onUnlock: () => void;
  initialMode?: 'calculator' | 'weather';
}

const WEATHER_LOCATIONS = [
  { name: 'Kakuma 1 (HQ / Clinic 1)', temp: '34°C', high: '36°', low: '24°', condition: 'Sunny & Hot', humidity: '24%', wind: '19 km/h NE', uv: '10 Very High' },
  { name: 'Kakuma 2 & 3 (Zone B)', temp: '33°C', high: '35°', low: '23°', condition: 'Sunny & Dry', humidity: '26%', wind: '16 km/h NE', uv: '9 Very High' },
  { name: 'Kakuma 4 (Zone C)', temp: '34°C', high: '36°', low: '24°', condition: 'Clear Sky', humidity: '22%', wind: '20 km/h NE', uv: '10 Very High' },
  { name: 'Kalobeyei Settlement (Village 1-3)', temp: '35°C', high: '37°', low: '25°', condition: 'Dry & Breezy', humidity: '21%', wind: '22 km/h E', uv: '11 Extreme' },
  { name: 'Lodwar Central Hub', temp: '36°C', high: '38°', low: '26°', condition: 'Hot & Clear', humidity: '20%', wind: '18 km/h E', uv: '11 Extreme' },
];

export const CamouflageView: React.FC<CamouflageProps> = ({ onUnlock, initialMode = 'weather' }) => {
  const [mode, setMode] = useState<'calculator' | 'weather'>(initialMode);
  const [selectedLocIndex, setSelectedLocIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [secretTapCount, setSecretTapCount] = useState(0);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Hook up double shake inside Camouflage view to bring up the PIN unlock prompt
  useDeviceShake({
    onDoubleShake: () => {
      setShowPinModal(true);
    },
    enabled: true
  });

  // Calculator state
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [clearNext, setClearNext] = useState(false);
  const [codeBuffer, setCodeBuffer] = useState('');

  // Handle calculator buttons
  const handleDigit = (digit: string) => {
    const newBuffer = (codeBuffer + digit).slice(-6);
    setCodeBuffer(newBuffer);

    // Instant unlock check if code is 1195 or 1517 or 9999
    if (newBuffer.endsWith('1195') || newBuffer.endsWith('1517') || newBuffer.endsWith('9999')) {
      onUnlock();
      return;
    }

    if (calcDisplay === '0' || clearNext) {
      setCalcDisplay(digit);
      setClearNext(false);
    } else {
      setCalcDisplay(calcDisplay + digit);
    }
  };

  const handleOp = (op: string) => {
    setPrevVal(parseFloat(calcDisplay));
    setOperator(op);
    setClearNext(true);
  };

  const handleEquals = () => {
    // Secret sequence trigger check: if user entered 1195 or 1517 before equals
    if (codeBuffer.includes('1195') || codeBuffer.includes('1517') || calcDisplay === '1195' || calcDisplay === '1517') {
      onUnlock();
      return;
    }

    if (operator && prevVal !== null) {
      const current = parseFloat(calcDisplay);
      let res = 0;
      switch (operator) {
        case '+': res = prevVal + current; break;
        case '-': res = prevVal - current; break;
        case '×': res = prevVal * current; break;
        case '÷': res = current !== 0 ? prevVal / current : 0; break;
      }
      setCalcDisplay(String(Number(res.toFixed(6))));
      setPrevVal(null);
      setOperator(null);
      setClearNext(true);
    }
  };

  const handleClear = () => {
    setCalcDisplay('0');
    setPrevVal(null);
    setOperator(null);
    setCodeBuffer('');
  };

  const handleSecretTap = () => {
    const nextCount = secretTapCount + 1;
    setSecretTapCount(nextCount);
    if (nextCount >= 3) {
      setSecretTapCount(0);
      setShowPinModal(true);
    }
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (enteredPin === '1195' || enteredPin === '1517' || enteredPin === '9999' || enteredPin === '0000') {
      setShowPinModal(false);
      onUnlock();
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1500);
      setEnteredPin('');
    }
  };

  const currentLocation = WEATHER_LOCATIONS[selectedLocIndex];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white select-none relative">
      {/* Discreet top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex gap-2">
          <button 
            onClick={() => setMode('weather')} 
            className={`px-2.5 py-1 rounded-md font-medium text-[11px] flex items-center gap-1 ${mode === 'weather' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}
          >
            <CloudSun className="w-3.5 h-3.5 text-amber-400" /> Weather Cast
          </button>
          <button 
            onClick={() => setMode('calculator')} 
            className={`px-2.5 py-1 rounded-md font-medium text-[11px] ${mode === 'calculator' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
          >
            Calc Tool
          </button>
        </div>

        {/* Secret tap helper with unlock hint if long pressed */}
        <button 
          onClick={() => setShowPinModal(true)}
          className="text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded transition flex items-center gap-1"
          title="Discreet safety exit code: 1195"
        >
          <span>v3.4</span>
          <KeyRound className="w-3 h-3 text-slate-600 hover:text-slate-400" />
        </button>
      </div>

      {mode === 'calculator' ? (
        <div className="flex-1 flex flex-col justify-end p-5 max-w-sm mx-auto w-full">
          {/* Calculator screen */}
          <div className="text-right mb-6 px-2">
            <span className="text-[11px] text-slate-500 font-mono block h-4">
              {operator && prevVal !== null ? `${prevVal} ${operator}` : ''}
            </span>
            <div className="text-4xl font-light tracking-tight font-mono truncate text-white">
              {calcDisplay}
            </div>
          </div>

          {/* Calculator keypad */}
          <div className="grid grid-cols-4 gap-2.5">
            <button onClick={handleClear} className="p-3.5 bg-slate-700 hover:bg-slate-600 rounded-2xl text-amber-400 font-bold text-lg active:scale-95 transition">C</button>
            <button onClick={() => { setCalcDisplay(String(parseFloat(calcDisplay) * -1)); }} className="p-3.5 bg-slate-700 hover:bg-slate-600 rounded-2xl text-slate-300 font-bold text-lg active:scale-95 transition">±</button>
            <button onClick={() => { setCalcDisplay(String(parseFloat(calcDisplay) / 100)); }} className="p-3.5 bg-slate-700 hover:bg-slate-600 rounded-2xl text-slate-300 font-bold text-lg active:scale-95 transition">%</button>
            <button onClick={() => handleOp('÷')} className="p-3.5 bg-amber-600 hover:bg-amber-500 rounded-2xl text-white font-bold text-xl active:scale-95 transition">÷</button>

            <button onClick={() => handleDigit('7')} className="p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-semibold text-xl active:scale-95 transition">7</button>
            <button onClick={() => handleDigit('8')} className="p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-semibold text-xl active:scale-95 transition">8</button>
            <button onClick={() => handleDigit('9')} className="p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-semibold text-xl active:scale-95 transition">9</button>
            <button onClick={() => handleOp('×')} className="p-3.5 bg-amber-600 hover:bg-amber-500 rounded-2xl text-white font-bold text-xl active:scale-95 transition">×</button>

            <button onClick={() => handleDigit('4')} className="p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-semibold text-xl active:scale-95 transition">4</button>
            <button onClick={() => handleDigit('5')} className="p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-semibold text-xl active:scale-95 transition">5</button>
            <button onClick={() => handleDigit('6')} className="p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-semibold text-xl active:scale-95 transition">6</button>
            <button onClick={() => handleOp('-')} className="p-3.5 bg-amber-600 hover:bg-amber-500 rounded-2xl text-white font-bold text-xl active:scale-95 transition">−</button>

            <button onClick={() => handleDigit('1')} className="p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-semibold text-xl active:scale-95 transition">1</button>
            <button onClick={() => handleDigit('2')} className="p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-semibold text-xl active:scale-95 transition">2</button>
            <button onClick={() => handleDigit('3')} className="p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-semibold text-xl active:scale-95 transition">3</button>
            <button onClick={() => handleOp('+')} className="p-3.5 bg-amber-600 hover:bg-amber-500 rounded-2xl text-white font-bold text-xl active:scale-95 transition">+</button>

            <button onClick={() => handleDigit('0')} className="col-span-2 p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-semibold text-xl text-left pl-6 active:scale-95 transition">0</button>
            <button onClick={() => { if (!calcDisplay.includes('.')) setCalcDisplay(calcDisplay + '.'); }} className="p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-semibold text-xl active:scale-95 transition">.</button>
            <button onClick={handleEquals} className="p-3.5 bg-amber-500 hover:bg-amber-400 rounded-2xl text-white font-bold text-xl active:scale-95 transition">=</button>
          </div>

          <div className="text-center mt-4">
            <span className="text-[10px] text-slate-600 tracking-wider">
              Discreet Mode Active • Type PIN or press =
            </span>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-4 overflow-y-auto no-scrollbar max-w-sm mx-auto w-full space-y-3.5">
          {/* Location Selector Tabs */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {WEATHER_LOCATIONS.map((loc, idx) => (
              <button
                key={loc.name}
                onClick={() => setSelectedLocIndex(idx)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                  selectedLocIndex === idx
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {loc.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Current Weather Card */}
          <div className="bg-gradient-to-br from-sky-900 via-sky-950 to-indigo-950 p-5 rounded-3xl border border-sky-800/50 text-center shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400">
                {currentLocation.name}
              </span>
              <button 
                onClick={handleRefresh}
                className="text-sky-400 hover:text-sky-200 p-1 rounded-full active:rotate-180 transition-transform"
                title="Update weather"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Secret interactive tap zone on weather icon */}
            <div 
              onClick={handleSecretTap} 
              className="flex items-center justify-center my-2 cursor-pointer active:scale-95 transition-transform"
              title="Weather icon"
            >
              <Sun className="w-16 h-16 text-amber-400 animate-spin" style={{ animationDuration: '45s' }} />
            </div>

            <div 
              onClick={handleSecretTap}
              className="text-5xl font-extralight text-white font-mono mb-1 cursor-pointer"
            >
              {currentLocation.temp}
            </div>
            <p className="text-sm text-sky-200 font-medium">{currentLocation.condition}</p>
            <p className="text-[11px] text-sky-400/80 mt-0.5">H: {currentLocation.high} • L: {currentLocation.low}</p>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-sky-800/60 text-left text-[11px]">
              <div>
                <span className="text-[10px] text-sky-400 block">Wind</span>
                <span className="text-white font-medium">{currentLocation.wind}</span>
              </div>
              <div>
                <span className="text-[10px] text-sky-400 block">Humidity</span>
                <span className="text-white font-medium">{currentLocation.humidity}</span>
              </div>
              <div>
                <span className="text-[10px] text-sky-400 block">UV Index</span>
                <span className="text-white font-medium">{currentLocation.uv}</span>
              </div>
            </div>
          </div>

          {/* Hourly Forecast Strip */}
          <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Hourly Today</h4>
            <div className="flex justify-between items-center text-center text-xs">
              {[
                { time: '09:00', temp: '31°', icon: <Sun className="w-4 h-4 text-amber-400 mx-auto" /> },
                { time: '12:00', temp: '34°', icon: <Sun className="w-4 h-4 text-amber-400 mx-auto" /> },
                { time: '15:00', temp: '36°', icon: <Sun className="w-4 h-4 text-amber-400 mx-auto" /> },
                { time: '18:00', temp: '32°', icon: <CloudSun className="w-4 h-4 text-amber-300 mx-auto" /> },
                { time: '21:00', temp: '28°', icon: <Sun className="w-4 h-4 text-sky-300 mx-auto" /> },
              ].map((h, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400">{h.time}</span>
                  {h.icon}
                  <span className="text-white font-mono text-[11px] font-medium">{h.temp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5-day forecast list */}
          <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">5-Day Outlook</h4>
            {[
              { day: 'Today', temp: '34° / 24°', cond: 'Sunny' },
              { day: 'Tomorrow', temp: '35° / 23°', cond: 'Clear Sky' },
              { day: 'Wednesday', temp: '33° / 24°', cond: 'Light Breeze' },
              { day: 'Thursday', temp: '36° / 25°', cond: 'Hot & Sunny' },
              { day: 'Friday', temp: '34° / 23°', cond: 'Partly Cloudy' },
            ].map((f, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-700/40 last:border-none">
                <span className="text-slate-300 font-medium w-24">{f.day}</span>
                <span className="text-slate-400 text-[11px]">{f.cond}</span>
                <span className="text-white font-mono font-medium">{f.temp}</span>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-slate-800/40 rounded-xl text-center">
            <button 
              onClick={() => setShowPinModal(true)}
              className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1.5 mx-auto py-1"
            >
              <KeyRound className="w-3.5 h-3.5" /> Return to Safety Portal (Code: 1195)
            </button>
          </div>
        </div>
      )}

      {/* Secret PIN Unlock Modal */}
      {showPinModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-4 text-center">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Discreet Safety Authentication</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Enter 4-digit PIN to exit camouflage (default: 1195)</p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="• • • •"
                className={`w-full text-center tracking-[0.5em] font-mono text-xl py-2.5 bg-slate-800 border rounded-xl text-white focus:outline-none ${
                  pinError ? 'border-red-500 bg-red-950/20' : 'border-slate-600 focus:border-indigo-500'
                }`}
              />

              {pinError && (
                <p className="text-red-400 text-[11px]">Incorrect code. Try 1195.</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setEnteredPin('');
                  }}
                  className="flex-1 py-2 bg-slate-800 text-slate-400 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                >
                  Unlock
                </button>
              </div>

              {/* Direct Quick Unlock Button */}
              <button
                type="button"
                onClick={() => {
                  setShowPinModal(false);
                  onUnlock();
                }}
                className="w-full text-[10px] text-slate-500 hover:text-slate-300 py-1"
              >
                Instant Emergency Exit (Return Now)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

