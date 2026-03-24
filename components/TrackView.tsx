import React, { useState, useEffect } from 'react';
import { Report, ReportStatus } from '../types';
import { BackendService } from '../services/mockBackend';
import { Search, Clipboard, Loader2, CheckCircle2, Circle, History, ArrowRight, MessageSquare } from 'lucide-react';

interface Props {
  initialCode?: string;
}

export const TrackView: React.FC<Props> = ({ initialCode = '' }) => {
  const [code, setCode] = useState(initialCode);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setHistory(BackendService.getHistory());
    if (initialCode) {
      handleTrack(initialCode);
    }
  }, [initialCode]);

  const handleTrack = async (trackingCode: string = code) => {
    if (!trackingCode) return;
    setLoading(true);
    setSearched(true);
    setReport(null);
    try {
      const result = await BackendService.getReportByCode(trackingCode);
      setReport(result);
      if (trackingCode !== code) setCode(trackingCode);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard');
  };

  // Complete status lifecycle
  const statusOrder = [
    ReportStatus.RECEIVED,
    ReportStatus.ASSIGNED,
    ReportStatus.IN_REVIEW,
    ReportStatus.ACTION_TAKEN,
    ReportStatus.RESOLVED
  ];

  const getStatusIndex = (status: ReportStatus) => {
    return statusOrder.indexOf(status);
  };

  const currentStatusIndex = report ? getStatusIndex(report.status) : -1;

  return (
    <div className="p-4 pb-20 animate-slide-up h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand-700 dark:text-brand-400">Track Case</h1>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-brand-600 flex items-center bg-brand-50 dark:bg-brand-900/30 px-3 py-1.5 rounded-full"
        >
          <History className="w-4 h-4 mr-1" />
          {showHistory ? 'Hide History' : 'My Codes'}
        </button>
      </div>

      {showHistory && (
        <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 animate-fade-in">
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Recently Submitted</h3>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400">No history found on this device.</p>
          ) : (
            <div className="space-y-2">
              {history.map(h => (
                <button 
                  key={h}
                  onClick={() => { handleTrack(h); setShowHistory(false); }}
                  className="w-full flex items-center justify-between p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  <span className="font-mono text-gray-700 dark:text-gray-300">{h}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Enter Tracking Code (e.g. SV-1234)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full pl-10 p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand-500 outline-none uppercase"
          />
        </div>
        <button 
          onClick={() => handleTrack()}
          disabled={loading || !code}
          className="bg-brand-600 text-white px-6 rounded-xl font-medium disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Track'}
        </button>
      </div>

      {report && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
             <div>
               <p className="text-xs text-gray-500 uppercase tracking-wider">Tracking Code</p>
               <h2 className="text-xl font-mono font-bold text-brand-600">{report.trackingCode}</h2>
             </div>
             <button onClick={copyCode} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
               <Clipboard className="w-5 h-5 text-gray-400" />
             </button>
          </div>

          <div className="relative pl-4 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
            {statusOrder.map((status, idx) => {
              const isCompleted = idx <= currentStatusIndex;
              const isCurrent = idx === currentStatusIndex;
              
              return (
                <div key={status} className="relative pl-8">
                  <div className={`absolute left-0 top-1 w-10 h-10 -ml-5 flex items-center justify-center rounded-full border-4 ${
                    isCompleted 
                      ? 'bg-brand-500 border-white dark:border-gray-800 text-white' 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-300'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                      {status}
                    </h3>
                    {isCurrent && (
                      <p className="text-sm text-brand-500 mt-1">Current Status</p>
                    )}
                    {isCompleted && isCurrent && (
                      <p className="text-xs text-gray-400 mt-1">
                         {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Case Updates Section */}
          {report.caseUpdates && report.caseUpdates.length > 0 && (
            <div className="mt-8">
                <h4 className="flex items-center gap-2 font-bold mb-3 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <MessageSquare className="w-4 h-4 text-brand-600" />
                    Case Updates
                </h4>
                <div className="space-y-3">
                    {report.caseUpdates.map(update => (
                        <div key={update.id} className="bg-brand-50 dark:bg-brand-900/10 p-3 rounded-xl text-sm border-l-4 border-brand-500">
                            <p className="text-gray-800 dark:text-gray-200 mb-2">{update.content}</p>
                            <div className="flex justify-between items-center text-xs text-gray-400">
                                <span className="font-semibold text-brand-700 dark:text-brand-400">{update.author}</span>
                                <span>{new Date(update.timestamp).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}
          
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <h4 className="font-medium mb-2 text-sm text-gray-500">Submitted Description</h4>
            <p className="text-gray-700 dark:text-gray-300 italic">"{report.description}"</p>
          </div>
        </div>
      )}

      {!report && searched && !loading && (
        <div className="text-center mt-10 text-gray-500">
          <p>No report found with that code.</p>
        </div>
      )}
    </div>
  );
};