import React, { useState, useEffect } from 'react';
import { Caseworker } from '../types';
import { BackendService } from '../services/mockBackend';
import { Plus, User, Phone, Mail, Edit2, Trash2, X, Save, Loader2 } from 'lucide-react';

export const CaseWorkersView: React.FC = () => {
  const [workers, setWorkers] = useState<Caseworker[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Caseworker | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = BackendService.subscribeToCaseworkers((data) => {
        setWorkers(data);
        setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleOpenModal = (worker?: Caseworker) => {
    if (worker) {
        setEditingWorker(worker);
        setFormData({ name: worker.name, phone: worker.phone, email: worker.email });
    } else {
        setEditingWorker(null);
        setFormData({ name: '', phone: '', email: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        if (editingWorker) {
            await BackendService.updateCaseworker(editingWorker.id, formData);
        } else {
            await BackendService.addCaseworker(formData);
        }
        setIsModalOpen(false);
    } catch (e) {
        alert("Operation failed.");
    } finally {
        setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this case worker? This cannot be undone.")) {
        await BackendService.deleteCaseworker(id);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Case Workers</h2>
            <p className="text-sm text-gray-500">Manage staff members who handle cases.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Worker
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
           <div className="flex justify-center py-10">
             <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
           </div>
        ) : workers.length === 0 ? (
           <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
             <User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
             <p className="text-gray-500">No case workers found.</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {workers.map(worker => (
               <div key={worker.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group">
                 <div className="flex justify-between items-start mb-3">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                       {worker.name.charAt(0)}
                     </div>
                     <div>
                       <h3 className="font-bold text-gray-900 dark:text-white">{worker.name}</h3>
                       <p className="text-xs text-gray-400">Added {new Date(worker.createdAt).toLocaleDateString()}</p>
                     </div>
                   </div>
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => handleOpenModal(worker)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                       <Edit2 className="w-4 h-4" />
                     </button>
                     <button onClick={() => handleDelete(worker.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
                 
                 <div className="space-y-2 mt-4 text-sm">
                   <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                     <Phone className="w-4 h-4" />
                     <span>{worker.phone}</span>
                   </div>
                   <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                     <Mail className="w-4 h-4" />
                     <span>{worker.email}</span>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
              <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-lg dark:text-white">{editingWorker ? 'Edit Worker' : 'New Case Worker'}</h3>
                <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                 <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Full Name</label>
                   <input 
                     required
                     type="text" 
                     value={formData.name}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                     className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-brand-500"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Phone Number</label>
                   <input 
                     required
                     type="tel" 
                     value={formData.phone}
                     onChange={e => setFormData({...formData, phone: e.target.value})}
                     className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-brand-500"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email Address</label>
                   <input 
                     required
                     type="email" 
                     value={formData.email}
                     onChange={e => setFormData({...formData, email: e.target.value})}
                     className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-brand-500"
                   />
                 </div>
                 <button 
                   type="submit"
                   disabled={submitting}
                   className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-brand-700 disabled:opacity-70 mt-4"
                 >
                   {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                   {editingWorker ? 'Update' : 'Save Worker'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};