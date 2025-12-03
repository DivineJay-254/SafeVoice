import React, { useState } from 'react';
import { GBVType, Attachment } from '../types';
import { BackendService } from '../services/mockBackend';
import { AlertCircle, Camera, Mic, MapPin, Loader2, CheckCircle, FileUp } from 'lucide-react';

export const ReportView: React.FC<{ onReportSubmitted: (code: string) => void }> = ({ onReportSubmitted }) => {
  const [type, setType] = useState<GBVType>(GBVType.PHYSICAL);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newAttachment: Attachment = {
        name: file.name,
        type: file.type.startsWith('image') ? 'image' : file.type.startsWith('audio') ? 'audio' : 'video',
        url: URL.createObjectURL(file) // For preview only
      };
      setFiles([...files, newAttachment]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !description) return;

    // Generate or retrieve anonymous user ID
    let anonymousUserId = localStorage.getItem('safevoice_anon_id');
    if (!anonymousUserId) {
      anonymousUserId = crypto.randomUUID();
      localStorage.setItem('safevoice_anon_id', anonymousUserId);
    }

    setIsSubmitting(true);
    try {
      const report = await BackendService.createReport({
        type,
        location,
        description,
        attachments: files,
        anonymousUserId
      });
      setTrackingCode(report.trackingCode);
      setSuccess(true);
      
      // Delay redirect slightly so they see the code
      setTimeout(() => {
        onReportSubmitted(report.trackingCode);
      }, 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to submit report. Ensure backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Report Received</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Your tracking code is:</p>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl mb-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <span className="text-3xl font-mono font-bold text-brand-600 tracking-wider select-all">
            {trackingCode}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 animate-pulse">Redirecting to tracker...</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 animate-slide-up">
      <h1 className="text-2xl font-bold mb-6 text-brand-700 dark:text-brand-400">Anonymous Report</h1>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6 rounded-r">
        <div className="flex">
          <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-yellow-700 dark:text-yellow-200">
            Your safety is priority. If you are in immediate danger, please call 1195 or 999 immediately.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Type of Incident</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value as GBVType)}
            className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand-500 outline-none"
          >
            {Object.values(GBVType).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="e.g. Kibera, Nairobi"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand-500 outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea 
            placeholder="Describe what happened..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 h-32 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Evidence / Attachments (Optional)</label>
          <div className="flex gap-4 mb-4">
             <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-brand-400 transition-colors">
                <Camera className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
             </label>
             <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-brand-400 transition-colors">
                <Mic className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Audio</span>
                <input type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
             </label>
             <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-brand-400 transition-colors">
                <FileUp className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Video</span>
                <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
             </label>
          </div>
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f, idx) => (
                <div key={idx} className="flex items-center text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span className="truncate">{f.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white p-4 rounded-xl font-bold shadow-lg shadow-brand-500/30 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center"
        >
          {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Submit Securely'}
        </button>
      </form>
    </div>
  );
};
