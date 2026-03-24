
import React, { useState, useEffect } from 'react';
import { Report, ReportStatus, Caseworker, GBVType } from '../types';
import { BackendService } from '../services/mockBackend';
import { CaseWorkersView } from './CaseWorkersView';
import { AdminChatManager } from './AdminChatManager';
import { 
  LayoutDashboard, LogOut, Search, Eye, 
  MapPin, CheckCircle2, AlertCircle, Clock, X, 
  Settings, Users, Activity, Phone, ListChecks,
  MessageCircle
} from 'lucide-react';

export const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'caseworkers' | 'chats'>('dashboard');

  useEffect(() => {
    const unsubscribe = BackendService.subscribeToReports(setReports);
    setLoading(false);
    return () => unsubscribe();
  }, []);

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.RECEIVED: return 'bg-gray-100 text-gray-800';
      case ReportStatus.RESOLVED: return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredReports = reports.filter(r => 
    r.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-full overflow-hidden">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center text-white font-bold">SV</div>
            <h1 className="font-bold text-xl dark:text-white">Admin Portal</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center w-full p-3 rounded-xl font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </button>
          <button onClick={() => setActiveTab('chats')} className={`flex items-center w-full p-3 rounded-xl font-medium transition-colors ${activeTab === 'chats' ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <MessageCircle className="w-5 h-5 mr-3" /> Live Chats
          </button>
          <button onClick={() => setActiveTab('caseworkers')} className={`flex items-center w-full p-3 rounded-xl font-medium transition-colors ${activeTab === 'caseworkers' ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Users className="w-5 h-5 mr-3" /> Staff
          </button>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={onLogout} className="flex items-center text-gray-500 hover:text-red-500 p-2"><LogOut className="w-5 h-5 mr-3" /> Logout</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold dark:text-white">
            {activeTab === 'dashboard' ? 'Incidents' : activeTab === 'chats' ? 'Support Sessions' : 'Staff'}
          </h2>
          {activeTab === 'dashboard' && (
            <div className="flex items-center gap-3">
               <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search incidents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:bg-gray-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
               </div>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'caseworkers' && <CaseWorkersView />}
          {activeTab === 'chats' && <AdminChatManager />}
          {activeTab === 'dashboard' && (
            <div className="h-full overflow-y-auto p-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 text-xs text-gray-500 uppercase font-black">
                    <tr>
                      <th className="px-6 py-4">ID Code</th>
                      <th className="px-6 py-4">Incident Category</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredReports.map(report => (
                      <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 font-mono font-bold text-pink-600">{report.trackingCode}</td>
                        <td className="px-6 py-4 text-sm font-medium dark:text-gray-300">{report.type}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(report.status)}`}>{report.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setSelectedReport(report)} className="text-gray-400 hover:text-pink-600"><Eye className="w-5 h-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {selectedReport && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
            <div className="w-full md:w-[500px] bg-white dark:bg-gray-900 h-full shadow-2xl overflow-y-auto animate-slide-up flex flex-col">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                 <div>
                    <h2 className="text-xl font-bold dark:text-white">Case Detail</h2>
                    <p className="text-pink-600 font-mono text-sm">{selectedReport.trackingCode}</p>
                 </div>
                 <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              </div>

              <div className="p-8 space-y-8 flex-1">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border">
                    <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Category</p>
                    <p className="text-sm font-bold dark:text-gray-100">{selectedReport.type}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border">
                    <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Status</p>
                    <p className="text-sm font-bold dark:text-gray-100">{selectedReport.status}</p>
                  </div>
                </div>

                <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-pink-100 dark:border-pink-900 flex items-center gap-4">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 flex-shrink-0">
                        <Phone className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black">Contact Info</p>
                        <p className="text-sm font-bold dark:text-gray-100">{selectedReport.phoneNumber || 'Not Provided'}</p>
                    </div>
                </div>

                <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl border">
                   <div className="flex items-center gap-2 mb-2">
                       <MapPin className="w-4 h-4 text-gray-400" />
                       <h3 className="text-xs font-black text-gray-400 uppercase">Reported Location</h3>
                   </div>
                   <p className="text-sm font-medium dark:text-gray-100">{selectedReport.location}</p>
                   {selectedReport.location.includes('maps.google.com') && (
                       <a href={selectedReport.location} target="_blank" className="mt-3 inline-block text-[10px] font-bold text-pink-600 underline">View on GPS Map</a>
                   )}
                </div>

                <div className="pt-8 border-t dark:border-gray-800">
                    <h3 className="text-xs font-black text-gray-400 uppercase mb-4">Update Status</h3>
                    <div className="flex gap-2 mb-4">
                      <select 
                        value={selectedReport.status} 
                        onChange={async (e) => {
                          const newStatus = e.target.value as ReportStatus;
                          await BackendService.updateReportStatus(selectedReport.id, newStatus);
                          setSelectedReport({...selectedReport, status: newStatus});
                        }}
                        className="flex-1 p-2 rounded-lg border border-gray-200 dark:bg-gray-800 text-sm"
                      >
                        {Object.values(ReportStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <h3 className="text-xs font-black text-gray-400 uppercase mb-4">Add Case Update</h3>
                    <div className="space-y-2 mb-8">
                      <textarea 
                        id="case-update-text"
                        placeholder="Type update here..." 
                        className="w-full p-3 rounded-xl border border-gray-200 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-pink-500"
                      />
                      <button 
                        onClick={async () => {
                          const el = document.getElementById('case-update-text') as HTMLTextAreaElement;
                          if (el.value.trim()) {
                            await BackendService.addCaseUpdate(selectedReport.id, el.value, 'Admin');
                            el.value = '';
                            // Refresh will happen via subscription
                          }
                        }}
                        className="w-full bg-pink-600 text-white py-2 rounded-xl font-bold text-sm"
                      >
                        Post Update
                      </button>
                    </div>

                    <h3 className="text-xs font-black text-gray-400 uppercase mb-4">Case Progression</h3>
                    <div className="space-y-4">
                        {(selectedReport.statusHistory || []).map((h, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-2 h-2 rounded-full bg-pink-500 mt-1.5 flex-shrink-0"></div>
                                <div>
                                    <p className="text-xs font-bold dark:text-gray-100">{h.status}</p>
                                    <p className="text-[10px] text-gray-400">{new Date(h.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
