import React, { useState } from 'react';
import { CloudSun, Sun, Wind, Droplets, ArrowLeft, RefreshCw, KeyRound, Sparkles } from 'lucide-react';

interface CamouflageProps {
  onUnlock: () => void;
}

export const CamouflageView: React.FC<CamouflageProps> = ({ onUnlock }) => {
  const [mode, setMode] = useState<'calculator' | 'weather'>('calculator');
  
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

    // Instant unlock check if code is 1195 or 1517
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

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white select-none">
      {/* Discreet top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex gap-2">
          <button 
            onClick={() => setMode('calculator')} 
            className={`px-2.5 py-1 rounded-md font-medium text-[11px] ${mode === 'calculator' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
          >
            Calc Tool
          </button>
          <button 
            onClick={() => setMode('weather')} 
            className={`px-2.5 py-1 rounded-md font-medium text-[11px] ${mode === 'weather' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
          >
            Weather Cast
          </button>
        </div>

        {/* Secret tap helper with unlock hint if long pressed */}
        <button 
          onClick={onUnlock}
          className="text-[10px] text-slate-600 hover:text-slate-400 px-2 py-1 rounded transition"
          title="Discreet safety exit code: 1195"
        >
          v3.2
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
        <div className="flex-1 p-5 overflow-y-auto no-scrollbar max-w-sm mx-auto w-full space-y-4">
          {/* Weather skin */}
          <div className="bg-gradient-to-br from-sky-900 to-indigo-950 p-6 rounded-3xl border border-sky-800/50 text-center shadow-lg">
            <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400 block mb-1">
              Turkana West • Kakuma Region
            </span>
            <div className="flex items-center justify-center my-3">
              <Sun className="w-16 h-16 text-amber-400 animate-spin" style={{ animationDuration: '40s' }} />
            </div>
            <div className="text-5xl font-extralight text-white font-mono mb-1">
              34°C
            </div>
            <p className="text-sm text-sky-200 font-medium">Sunny & Dry • High UV Index</p>

            <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-sky-800/60 text-left">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-sky-400" />
                <span className="text-xs text-sky-100">Wind: 18 km/h NE</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-400" />
                <span className="text-xs text-sky-100">Humidity: 26%</span>
              </div>
            </div>
          </div>

          {/* 5-day forecast list */}
          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">5-Day Outlook</h4>
            {[
              { day: 'Today', temp: '34° / 24°', cond: 'Sunny' },
              { day: 'Tomorrow', temp: '35° / 23°', cond: 'Clear Sky' },
              { day: 'Wednesday', temp: '33° / 24°', cond: 'Light Breeze' },
              { day: 'Thursday', temp: '36° / 25°', cond: 'Hot' },
              { day: 'Friday', temp: '34° / 23°', cond: 'Partly Cloudy' },
            ].map((f, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-700/40 last:border-none">
                <span className="text-slate-300 font-medium w-24">{f.day}</span>
                <span className="text-slate-400 text-[11px]">{f.cond}</span>
                <span className="text-white font-mono font-medium">{f.temp}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl text-center">
            <button 
              onClick={onUnlock}
              className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1.5 mx-auto"
            >
              <KeyRound className="w-3.5 h-3.5" /> Return to Portal (PIN: 1195)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
