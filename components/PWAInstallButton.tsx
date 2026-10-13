import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-brand-700 active:scale-95 transition"
        title="Install app for offline safety access"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-full border border-pink-300 dark:border-pink-800 bg-pink-50 dark:bg-pink-950/40 px-2.5 py-1 text-[11px] font-bold text-brand-700 dark:text-brand-300 hover:bg-pink-100 transition"
          title="Install on iPhone / iPad"
        >
          <Smartphone className="w-3 h-3" />
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 animate-slide-up">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-brand-600" />
                  Install Juasafety on iOS
                </h3>
                <button onClick={() => setShowIOSGuide(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Keep emergency contacts and incident templates functional even without an internet connection:
              </p>
              <ol className="text-xs text-gray-700 dark:text-gray-300 space-y-2 list-decimal list-inside bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                <li>Tap the <strong className="text-brand-600">Share</strong> button (box with upward arrow) in the Safari toolbar.</li>
                <li>Scroll down and tap <strong className="text-brand-600">Add to Home Screen</strong>.</li>
                <li>Tap <strong className="text-brand-600">Add</strong> in top-right corner.</li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-brand-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-700 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
