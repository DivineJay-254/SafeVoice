import React, { useState, useEffect } from 'react';
import { Report, ReportStatus, GBVType } from '../types';
import { BackendService } from '../services/mockBackend';
import { 
  LayoutDashboard, LogOut, Search, Filter, Eye, 
  MoreHorizontal, Calendar, MapPin, CheckCircle2, 
  AlertCircle, Clock, X, Save 
} from 'lucide-react';

export const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data on mount
  const refreshData = async () => {
    setLoading(true);
    const data = await BackendService.getAllReports();
    // Sort by newest first
    const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setReports(sorted);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleStatusUpdate = async (newStatus: ReportStatus) => {
    if (!selectedReport) return;
    try {
      await BackendService.updateReportStatus(selectedReport.id, newStatus);
      setSelectedReport(prev => prev ? { ...prev, status: newStatus } : null);
      refreshData();
      // Don't close modal, just update UI
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchesSearch = r.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.RECEIVED: return 'bg-gray-100 text-gray-800';
      case ReportStatus.ASSIGNED: return 'bg-blue-100 text-blue-800';
      case ReportStatus.IN_REVIEW: return 'bg-yellow-100 text-yellow-800';
      case ReportStatus.ACTION_TAKEN: return 'bg-purple-100 text-purple-800';
      case ReportStatus.RESOLVED: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
           <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              SV
            </div>
            <h1 className="font-bold text-xl tracking-tight text-gray-800 dark:text-white">Admin Panel</h1>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="flex items-center w-full p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-medium">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </button>
          <div className="pt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider pl-3">Stats</div>
          <div className="grid grid-cols-2 gap-2 p-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{reports.length}</div>
              <div className="text-xs text-blue-600/70 dark:text-blue-300">Total</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {reports.filter(r => r.status === ReportStatus.RECEIVED).length}
              </div>
              <div className="text-xs text-yellow-600/70 dark:text-yellow-300">Pending</div>
            </div>
          </div>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onLogout} className="flex items-center text-gray-500 hover:text-red-500 transition-colors w-full p-2">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Case Management</h2>
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search code..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm w-64 focus:ring-2 focus:ring-brand-500 outline-none"
                />
             </div>
             <button onClick={onLogout} className="md:hidden p-2">
               <LogOut className="w-5 h-5 text-gray-500" />
             </button>
          </div>
        </header>

        {/* Filters */}
        <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar">
          {['All', ...Object.values(ReportStatus)].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterStatus === status 
                ? 'bg-brand-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Table List */}
        <div className="flex-1 overflow-auto px-6 pb-6">
          {loading ? (
             <div className="flex justify-center items-center h-64">Loading...</div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Tracking Code</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredReports.map(report => (
                    <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-brand-600">{report.trackingCode}</td>
                      <td className="px-6 py-4 text-sm">{report.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedReport(report)}
                          className="text-gray-400 hover:text-brand-600 p-1"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No reports found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedReport && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
            <div className="w-full md:w-[600px] bg-white dark:bg-gray-900 h-full shadow-2xl animate-slide-up md:animate-none overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-10">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Case Details</h2>
                    <p className="text-brand-600 font-mono">{selectedReport.trackingCode}</p>
                 </div>
                 <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Status Control */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Update Status</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(ReportStatus).map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusUpdate(s)}
                        disabled={selectedReport.status === s}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                          selectedReport.status === s 
                          ? 'bg-brand-600 text-white border-brand-600 shadow-md ring-2 ring-offset-2 ring-brand-500' 
                          : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs uppercase font-semibold">Incident Type</span>
                    </div>
                    <p className="font-medium">{selectedReport.type}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs uppercase font-semibold">Location</span>
                    </div>
                    <p className="font-medium">{selectedReport.location}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs uppercase font-semibold">Date Reported</span>
                    </div>
                    <p className="font-medium">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs uppercase font-semibold">Anon User ID</span>
                    </div>
                    <p className="font-medium text-xs font-mono">{selectedReport.anonymousUserId?.substring(0,8)}...</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                   <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Description</h3>
                   <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                     {selectedReport.description}
                   </div>
                </div>

                {/* Attachments */}
                {selectedReport.attachments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Evidence / Attachments</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedReport.attachments.map((att, i) => (
                        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-3">
                           <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                             {att.type === 'image' ? <Eye className="w-5 h-5" /> : <MoreHorizontal className="w-5 h-5" />}
                           </div>
                           <div className="overflow-hidden">
                             <p className="text-sm font-medium truncate">{att.name}</p>
                             <p className="text-xs text-gray-500 uppercase">{att.type}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};