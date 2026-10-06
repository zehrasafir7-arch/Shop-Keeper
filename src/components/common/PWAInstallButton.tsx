import React, { useState } from 'react';
import { Download, CheckCircle, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall.js';
import { InstallAppModal } from './InstallAppModal.js';

interface PWAInstallButtonProps {
  variant?: 'primary' | 'outline' | 'minimal' | 'header';
  className?: string;
  label?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'primary',
  className = '',
  label = 'Install App',
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already running inside standalone app mode
  if (isInstalled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        <span>App Installed</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
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

  const buttonStyles = {
    primary:
      'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5',
    outline:
      'border border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-900/30 font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5',
    minimal:
      'text-blue-600 hover:text-blue-700 font-semibold text-xs transition-colors flex items-center gap-1',
    header:
      'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs',
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        disabled={installing}
        className={`${buttonStyles[variant]} ${className}`}
        title="Install Bussiness Billing on PC, Mac, Android, iPhone or Tablet"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>{installing ? 'Opening...' : label}</span>
      </button>

      {/* Rich Multi-Platform & Play Store Installation Modal */}
      <InstallAppModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
