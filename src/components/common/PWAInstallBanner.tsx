import React, { useState } from 'react';
import { Download, X, Laptop, Smartphone, Play } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall.js';
import { InstallAppModal } from './InstallAppModal.js';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Hide if already running in standalone app or dismissed
  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    if (isInstallable) {
      setInstalling(true);
      try {
        const success = await install();
        if (!success) {
          setShowModal(true);
        }
      } catch {
        setShowModal(true);
      } finally {
        setInstalling(false);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white px-4 py-2.5 sm:px-6 shadow-md border-b border-blue-800/40 relative z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-300 flex items-center justify-center shrink-0 border border-blue-500/30">
              <Download className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="font-bold flex items-center gap-1.5 flex-wrap">
                <span>Install Bussiness Billing App</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-semibold">
                  PC • Android • iPhone • Tablets
                </span>
              </p>
              <p className="text-[11px] text-slate-300">
                1-click desktop launch, offline POS cashiering, local receipt printing & native window mode.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={handleInstall}
              disabled={installing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{installing ? 'Opening...' : 'Install App Now'}</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-all border border-white/10"
              title="View all installation options & QR code"
            >
              How to Install
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <InstallAppModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
