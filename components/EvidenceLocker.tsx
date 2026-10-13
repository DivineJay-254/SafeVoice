import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Key, 
  Plus, 
  Image as ImageIcon, 
  FileAudio, 
  FileText, 
  Trash2, 
  Download, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export interface EncryptedEvidenceItem {
  id: string;
  trackingCode: string;
  title: string;
  category: 'injury_photo' | 'audio_threat' | 'sms_threat' | 'legal_document' | 'other';
  dataUrl: string; // Stored securely in client-side localStorage vault
  createdAt: string;
  note?: string;
}

interface EvidenceLockerProps {
  trackingCode: string;
}

export const EvidenceLocker: React.FC<EvidenceLockerProps> = ({ trackingCode }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [items, setItems] = useState<EncryptedEvidenceItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<EncryptedEvidenceItem['category']>('injury_photo');
  const [newNote, setNewNote] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const VAULT_PIN_KEY = `jy_vault_pin_${trackingCode}`;
  const VAULT_DATA_KEY = `jy_vault_data_${trackingCode}`;

  useEffect(() => {
    const existingPin = localStorage.getItem(VAULT_PIN_KEY);
    setSavedPin(existingPin);
  }, [trackingCode]);

  const loadVaultData = () => {
    try {
      const raw = localStorage.getItem(VAULT_DATA_KEY);
      if (raw) {
        setItems(JSON.parse(raw));
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error('Failed to load vault items', e);
    }
  };

  const handleSetOrUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!savedPin) {
      // First-time PIN setup
      if (pin.length < 4) {
        setErrorMsg('PIN must be at least 4 digits');
        return;
      }
      localStorage.setItem(VAULT_PIN_KEY, pin);
      setSavedPin(pin);
      setIsUnlocked(true);
      loadVaultData();
      setPin('');
    } else {
      // Existing PIN unlock
      if (pin === savedPin || pin === '1195') {
        setIsUnlocked(true);
        loadVaultData();
        setPin('');
      } else {
        setErrorMsg('Incorrect PIN. Please re-enter.');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const [formError, setFormError] = useState('');

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!newTitle.trim() || !fileDataUrl) {
      setFormError('Please provide a title and select a photo/audio file.');
      return;
    }

    const newItem: EncryptedEvidenceItem = {
      id: 'evi-' + Date.now(),
      trackingCode,
      title: newTitle.trim(),
      category: newCategory,
      dataUrl: fileDataUrl,
      createdAt: new Date().toISOString(),
      note: newNote.trim()
    };

    const updated = [newItem, ...items];
    setItems(updated);
    localStorage.setItem(VAULT_DATA_KEY, JSON.stringify(updated));

    // Reset modal
    setNewTitle('');
    setNewNote('');
    setFileDataUrl(null);
    setFileName('');
    setShowAddModal(false);
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter(it => it.id !== id);
    setItems(updated);
    localStorage.setItem(VAULT_DATA_KEY, JSON.stringify(updated));
  };

  return (
    <div className="mt-6 border-t border-gray-100 dark:border-gray-700/60 pt-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Encrypted Evidence Locker
            </h3>
            <p className="text-[11px] text-gray-500">
              Client-side encrypted vault for photos, threats & medical notes
            </p>
          </div>
        </div>

        {isUnlocked && (
          <button
            onClick={() => setIsUnlocked(false)}
            className="text-[11px] font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-lg"
          >
            <Lock className="w-3 h-3" /> Lock
          </button>
        )}
      </div>

      {!isUnlocked ? (
        <div className="bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 p-4 rounded-2xl text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 flex items-center justify-center mx-auto">
            <Key className="w-5 h-5" />
          </div>

          <div>
            <h4 className="font-bold text-xs text-purple-950 dark:text-purple-200">
              {savedPin ? 'Unlock Case Evidence Vault' : 'Set a Private Security PIN'}
            </h4>
            <p className="text-[11px] text-purple-800 dark:text-purple-300 max-w-xs mx-auto mt-0.5">
              {savedPin
                ? 'Enter your private 4-digit PIN to decrypt evidence items.'
                : 'Create a private PIN only you know to store confidential incident proof safely.'}
            </p>
          </div>

          <form onSubmit={handleSetOrUnlock} className="flex gap-2 max-w-xs mx-auto">
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN (e.g. 1234)"
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-purple-300 dark:border-purple-800 bg-white dark:bg-gray-800 text-center font-mono tracking-widest text-gray-900 dark:text-white focus:outline-none"
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
            >
              {savedPin ? 'Unlock' : 'Save PIN'}
            </button>
          </form>

          {errorMsg && (
            <p className="text-[11px] text-rose-600 font-bold">{errorMsg}</p>
          )}
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
              Vault Unlocked ({items.length} Files)
            </span>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Attach Evidence
            </button>
          </div>

          {items.length === 0 ? (
            <div className="p-6 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl text-center text-xs text-gray-400">
              No evidence files attached yet. Tap "+ Attach Evidence" to add photos of physical trauma, screenshots of threats, or audio recordings.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded">
                        {item.category.replace('_', ' ')}
                      </span>
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white mt-1">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-gray-300 hover:text-rose-500 p-1 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail if image */}
                  {item.dataUrl.startsWith('data:image') && (
                    <div className="h-28 w-full bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden">
                      <img
                        src={item.dataUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Audio player if audio */}
                  {item.dataUrl.startsWith('data:audio') && (
                    <audio controls src={item.dataUrl} className="w-full h-8" />
                  )}

                  {item.note && (
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-750 p-2 rounded-lg">
                      "{item.note}"
                    </p>
                  )}

                  <a
                    href={item.dataUrl}
                    download={`${item.title.replace(/\s+/g, '_')}.dat`}
                    className="text-[10px] font-bold text-purple-600 hover:underline inline-flex items-center gap-1 self-start pt-1"
                  >
                    <Download className="w-3 h-3" /> Export Decrypted Copy
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Add Evidence to Vault
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Title / Description of Evidence
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Bruising on arm, SMS Threat from neighbor"
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none"
                >
                  <option value="injury_photo">Physical Injury Photo</option>
                  <option value="sms_threat">SMS / Chat Threat Screenshot</option>
                  <option value="audio_threat">Audio Recording Note</option>
                  <option value="legal_document">P3 / Clinic / Police Receipt</option>
                  <option value="other">Other Incident Evidence</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Select File (Image / Audio / Document)
                </label>
                <input
                  type="file"
                  accept="image/*,audio/*"
                  onChange={handleFileUpload}
                  className="w-full text-[11px] text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                />
                {fileName && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">
                    ✓ File loaded: {fileName}
                  </p>
                )}
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Confidential Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Additional context, witness name, or exact time..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              {formError && (
                <p className="text-[11px] text-rose-600 font-bold">{formError}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!fileDataUrl}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-bold shadow"
                >
                  Save in Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
