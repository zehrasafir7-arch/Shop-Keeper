import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  Laptop,
  Smartphone,
  Apple,
  Play,
  QrCode,
  Copy,
  Check,
  Share,
  PlusSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  WifiOff,
  Zap,
  X,
  Layers,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall.js';
import { useToast } from './Toast.js';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'pc' | 'android' | 'ios' | 'playstore' | 'qr';
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'pc',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'pc' | 'android' | 'ios' | 'playstore' | 'qr'>(
    isIOS ? 'ios' : defaultTab
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Get current app URL
  const appUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';

  useEffect(() => {
    if (isOpen && appUrl) {
      QRCode.toDataURL(appUrl, {
        width: 260,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    setIsInstalling(true);
    try {
      const outcome = await install();
      if (outcome) {
        showToast('App installed successfully! Enjoy native standalone mode.', 'success');
        onClose();
      } else {
        showToast('Installation prompt closed or not supported in this frame.', 'info');
      }
    } catch {
      showToast('Please use your browser menu (Install app)', 'info');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(appUrl);
      setCopied(true);
      showToast('App URL copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0 transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full z-10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center p-2 shadow-inner">
              <img src="/pwa-192x192.png" alt="Bussiness Billing" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Install Bussiness Billing</h2>
                <span className="text-[10px] uppercase tracking-wider bg-white/20 text-white font-extrabold px-2 py-0.5 rounded-full">
                  PWA & Play Store
                </span>
              </div>
              <p className="text-xs text-blue-100">
                Install as a native standalone app on PC, Mac, Android, iPhone & Tablets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Install Banner (When Installable) */}
        {isInstallable && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-200 dark:border-emerald-800/50 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct 1-Click install is ready for this browser!</span>
            </div>
            <button
              onClick={handleNativeInstall}
              disabled={isInstalling}
              className="py-1.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isInstalling ? 'Installing...' : '1-Click Install Now'}</span>
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-4 pt-2 gap-1 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('pc')}
            className={`flex items-center gap-1.5 py-2.5 px-3 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'pc'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>PC & Mac (Chrome)</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center gap-1.5 py-2.5 px-3 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'android'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android & Tablet</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center gap-1.5 py-2.5 px-3 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'ios'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iPhone & iPad (iOS)</span>
          </button>

          <button
            onClick={() => setActiveTab('playstore')}
            className={`flex items-center gap-1.5 py-2.5 px-3 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'playstore'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Play className="w-4 h-4 text-emerald-600" />
            <span>Play Store / APK</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-1.5 py-2.5 px-3 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'qr'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <QrCode className="w-4 h-4 text-purple-600" />
            <span>Scan QR Code</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 dark:text-slate-300 text-xs">
          {/* TAB 1: PC & MAC (CHROME / EDGE) */}
          {activeTab === 'pc' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Desktop App for Windows, macOS & Linux
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    Runs in its own window without browser tabs, bookmarks, or distractions.
                  </p>
                </div>
                <button
                  onClick={handleNativeInstall}
                  className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Install on PC / Mac</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                    <span>Method 1: Address Bar Icon</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Look at the right side of your <strong>Google Chrome</strong> or <strong>Edge</strong> address bar (next to the bookmark star). Click the small <strong className="text-blue-600">Install icon (computer/down arrow)</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                    <span>Method 2: Browser 3-Dots Menu</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Click the <strong>⋮ (three dots)</strong> menu in Chrome/Edge ➔ Click <strong>"Save and share"</strong> or <strong>"Install Shopkeeper Pro..."</strong> ➔ Click <strong>Install</strong>.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40">
                <h5 className="font-bold text-indigo-950 dark:text-indigo-200 mb-2 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-indigo-600" /> PC Desktop Features
                </h5>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Adds desktop icon & Windows Start menu entry</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Works fully offline if internet goes down</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Print receipts directly to USB/thermal printer</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Pin to Windows Taskbar or macOS Dock</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID & TABLET */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/40">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Android Phones & POS Tablets
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    Full-screen mobile app experience with zero APK download required.
                  </p>
                </div>
                <button
                  onClick={handleNativeInstall}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Install on Android</span>
                </button>
              </div>

              <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                  Installing on Android via Google Chrome:
                </h5>
                <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-400">
                  <li>
                    Open this app link in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on your phone.
                  </li>
                  <li>
                    Look for the bottom prompt <strong>"Add Shopkeeper to Home screen"</strong> or tap the top install button.
                  </li>
                  <li>
                    Alternatively, tap the <strong>⋮ (3 dots)</strong> in Chrome at top-right ➔ tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </li>
                  <li>
                    Tap <strong>Install</strong>. The Shopkeeper Pro icon will appear on your home screen and in your Android App Drawer!
                  </li>
                </ol>
              </div>

              <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Need to open on your phone right now?</p>
                  <p className="text-[11px] text-slate-500">Scan the QR code or copy the app link.</p>
                </div>
                <button
                  onClick={() => setActiveTab('qr')}
                  className="py-1.5 px-3 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 flex items-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>View QR Code</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: IPHONE & IPAD (IOS) */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl text-white space-y-2 shadow-md">
                <div className="flex items-center gap-2">
                  <Apple className="w-5 h-5 text-white" />
                  <h4 className="font-bold text-sm">Install on iPhone & iPad (iOS)</h4>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Apple Safari allows any web app to be saved as an official standalone app on your Home Screen.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      Open in Safari & Tap Share
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      Open this website in <strong>Safari</strong> on your iPhone or iPad, then tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-blue-600 font-bold" /> at the bottom bar (or top toolbar on iPad).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      Tap "Add to Home Screen"
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      Scroll down in the share sheet and tap <strong className="text-slate-800 dark:text-slate-200">"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-blue-600 font-bold" />.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      Confirm by tapping "Add"
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      Tap <strong className="text-blue-600">Add</strong> in the top-right corner. The Shopkeeper app icon will appear right alongside your other iOS apps!
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                💡 <strong>Tip for iOS users:</strong> Ensure you are using <strong>Safari</strong> (not Chrome or in-app social browsers) when adding to Home Screen so iOS saves it with standalone display mode.
              </div>
            </div>
          )}

          {/* TAB 4: PLAY STORE / APK / TWA */}
          {activeTab === 'playstore' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-5 rounded-2xl text-white space-y-2">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                  <h4 className="font-bold text-sm">Google Play Store & Android APK Packaging</h4>
                </div>
                <p className="text-emerald-100 text-xs leading-relaxed">
                  This app is engineered to 100% Google Play <strong>Trusted Web Activity (TWA)</strong> compliance standards, including <code className="bg-white/10 px-1 py-0.5 rounded">.well-known/assetlinks.json</code> and Web App Manifest.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Generate an APK or Google Play Store Bundle in 2 Minutes:
                </h5>

                <div className="space-y-2 text-slate-600 dark:text-slate-400 text-xs">
                  <p>
                    You can package this live web application into a signed <strong>.APK</strong> or <strong>.AAB (Android App Bundle)</strong> to publish directly onto the <strong>Google Play Console</strong>:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5">
                    <li>
                      Copy your app URL:{' '}
                      <code className="text-[11px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400 font-mono select-all">
                        {appUrl}
                      </code>
                    </li>
                    <li>
                      Open <strong>PWABuilder (by Microsoft & Google)</strong> at{' '}
                      <a
                        href={`https://www.pwabuilder.com?url=${encodeURIComponent(appUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-bold inline-flex items-center gap-0.5"
                      >
                        pwabuilder.com <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                    <li>
                      Click <strong>"Package for Android"</strong> to download the complete APK / Android Studio project.
                    </li>
                    <li>
                      Upload the generated <code>.aab</code> package to your Google Play Developer Console!
                    </li>
                  </ol>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href={`https://www.pwabuilder.com?url=${encodeURIComponent(appUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Open PWABuilder Generator</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="py-2 px-3.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl font-bold text-xs flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Link Copied' : 'Copy Manifest URL'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 rounded-xl text-blue-900 dark:text-blue-300 text-[11px]">
                <strong>No Play Store account?</strong> You do not need the Play Store to install! Simply tap <strong>"Install App"</strong> in Chrome or Safari on your phone to install it directly with full offline and desktop capability.
              </div>
            </div>
          )}

          {/* TAB 5: SCAN QR CODE (INSTANT PHONE/TABLET TRANSFER) */}
          {activeTab === 'qr' && (
            <div className="text-center space-y-4 py-2">
              <div className="max-w-sm mx-auto space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Scan to Install on Your Phone or Tablet
                </h4>
                <p className="text-slate-500 text-xs">
                  Point your smartphone camera (iPhone or Android) at this QR code to open and install instantly.
                </p>
              </div>

              <div className="inline-block p-4 bg-white rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="App Install QR Code" className="w-52 h-52 mx-auto rounded-lg" />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs">
                    Generating QR code...
                  </div>
                )}
              </div>

              <div className="max-w-md mx-auto flex items-center justify-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 w-full font-mono truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>PWA Verified • HTTPS Secure • Offline Ready</span>
          </div>

          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
