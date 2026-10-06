import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 shadow-sm transition-all"
        title="Install BioLink App to Home Screen"
      >
        <Download className="w-3.5 h-3.5 text-rose-400" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5 text-rose-400" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl text-left">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-zinc-300 space-y-2 mb-4 leading-relaxed">
                <span>1. Tap the <strong>Share</strong> icon (square with arrow) in Safari.</span><br />
                <span>2. Scroll down and tap <strong>Add to Home Screen</strong>.</span><br />
                <span>3. Launch anytime from your phone like a native app!</span>
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-white transition-colors"
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
