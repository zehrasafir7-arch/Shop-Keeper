import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  Volume2,
  VolumeX,
  Flashlight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Barcode,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { playBarcodeBeep } from '../../lib/audioBeep.js';
import type { Product } from '../../types/index.js';

interface CameraBarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  products?: Product[];
  title?: string;
  subtitle?: string;
}

export const CameraBarcodeScannerModal: React.FC<CameraBarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  products = [],
  title = 'Live Camera Barcode Scanner',
  subtitle = 'Point camera at any product barcode or QR code',
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [continuousMode, setContinuousMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [manualInput, setManualInput] = useState('');

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'pos-interactive-barcode-reader';
  const lastScanTimeRef = useRef<number>(0);

  // Initialize camera and scanner when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      setErrorMessage(null);
      setLastScanned(null);

      // Brief delay to allow DOM element to render
      await new Promise((r) => setTimeout(r, 150));
      if (!isMounted) return;

      const element = document.getElementById(scannerContainerId);
      if (!element) return;

      try {
        // Enumerate video input devices
        const devices = await Html5Qrcode.getCameras().catch(() => []);
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back/environment camera
          const backCam = devices.find(
            (d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        }

        const formatsToSupport = [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
        ];

        const html5QrCode = new Html5Qrcode(scannerContainerId, {
          formatsToSupport,
          verbose: false,
        });
        html5QrCodeRef.current = html5QrCode;

        const cameraConfig = {
          facingMode: 'environment',
        };

        const config = {
          fps: 15,
          qrbox: { width: 280, height: 180 },
          aspectRatio: 1.333,
        };

        await html5QrCode.start(
          cameraConfig,
          config,
          (decodedText) => {
            handleDecodedBarcode(decodedText);
          },
          () => {
            // Frame scanned with no barcode - ignore
          }
        );

        if (isMounted) {
          setIsScanning(true);
          // Check if torch/flashlight is supported
          try {
            const capabilities = html5QrCode.getRunningTrackCapabilities();
            setHasTorch(Boolean((capabilities as any)?.torch));
          } catch {
            setHasTorch(false);
          }
        }
      } catch (err: any) {
        console.warn('Camera scanner initialization failed:', err);
        if (isMounted) {
          setIsScanning(false);
          const msg =
            err?.message ||
            'Camera access denied or unavailable. Please grant camera permission or use manual entry below.';
          setErrorMessage(msg);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      }
    } catch (e) {
      console.warn('Error clearing camera scanner:', e);
    } finally {
      html5QrCodeRef.current = null;
      setIsScanning(false);
      setTorchEnabled(false);
    }
  };

  const handleDecodedBarcode = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    // Debounce rapid multiple reads of the same barcode within 1.2 seconds
    const now = Date.now();
    if (cleanCode === lastScanned && now - lastScanTimeRef.current < 1200) {
      return;
    }

    lastScanTimeRef.current = now;
    setLastScanned(cleanCode);

    if (soundEnabled) {
      playBarcodeBeep();
    }

    onScan(cleanCode);

    if (!continuousMode) {
      onClose();
    }
  };

  const toggleTorch = async () => {
    if (!html5QrCodeRef.current || !hasTorch) return;
    try {
      const nextState = !torchEnabled;
      await html5QrCodeRef.current.applyVideoConstraints({
        advanced: [{ torch: nextState } as any],
      });
      setTorchEnabled(nextState);
    } catch (e) {
      console.warn('Torch toggle not supported', e);
    }
  };

  const switchCamera = async (deviceId: string) => {
    if (!html5QrCodeRef.current) return;
    try {
      await stopScanner();
      setSelectedCameraId(deviceId);
      // Re-trigger start with selected camera
      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        deviceId,
        { fps: 15, qrbox: { width: 280, height: 180 }, aspectRatio: 1.333 },
        (decodedText) => handleDecodedBarcode(decodedText),
        () => {}
      );
      setIsScanning(true);
    } catch (e: any) {
      setErrorMessage(e?.message || 'Failed to switch camera.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleDecodedBarcode(manualInput.trim());
    setManualInput('');
  };

  if (!isOpen) return null;

  // Filter products that have barcodes for 1-click test simulation
  const sampleProductsWithBarcodes = products.filter((p) => p.barcode && p.barcode.trim().length > 0).slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full z-10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-5 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">{title}</h3>
              <p className="text-[11px] text-slate-300">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title={soundEnabled ? 'Mute scanner beep' : 'Enable scanner beep'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Camera Viewfinder Area */}
        <div className="relative bg-black p-2 flex flex-col items-center justify-center min-h-[300px]">
          {/* html5-qrcode video mounting target */}
          <div id={scannerContainerId} className="w-full max-w-[420px] rounded-2xl overflow-hidden shadow-inner" />

          {/* Aiming Reticle / Laser Overlay */}
          {isScanning && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
              <div className="relative w-64 h-40 border-2 border-emerald-400/70 rounded-2xl shadow-lg shadow-emerald-500/20">
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-sm" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-sm" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-sm" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-sm" />

                {/* Laser animation bar */}
                <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-0.5 bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-pulse" />
              </div>
            </div>
          )}

          {/* Error / Permission fallback */}
          {errorMessage && (
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 z-10">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <p className="text-xs text-slate-200 max-w-xs">{errorMessage}</p>
              <p className="text-[11px] text-slate-400">
                You can still type barcodes manually below or use a hardware handheld USB scanner gun!
              </p>
            </div>
          )}

          {/* Quick Camera Toolbar (Flashlight & Camera Switcher) */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs z-10">
            {hasTorch ? (
              <button
                type="button"
                onClick={toggleTorch}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md transition-all ${
                  torchEnabled ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-black/60 text-white hover:bg-black/80'
                }`}
              >
                <Flashlight className="w-3.5 h-3.5" />
                <span>{torchEnabled ? 'Torch On' : 'Torch Off'}</span>
              </button>
            ) : <div />}

            {cameras.length > 1 && (
              <select
                value={selectedCameraId}
                onChange={(e) => switchCamera(e.target.value)}
                className="bg-black/70 text-white text-[10px] rounded-lg px-2 py-1 border border-white/20 focus:outline-none"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label || `Camera ${c.id.slice(0, 4)}`}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Last Scanned Feedback Toast */}
        {lastScanned && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs flex items-center justify-between animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Scanned Barcode: <b className="font-mono">{lastScanned}</b>
              </span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Added</span>
          </div>
        )}

        {/* Options & Manual Fallback */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={continuousMode}
                onChange={(e) => setContinuousMode(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span>Continuous Scanning (Keep camera open for rapid checkout)</span>
            </label>
          </div>

          {/* Manual Barcode Search or Keyboard Input */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Or type/paste barcode digits here..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 active:scale-95 transition-all shrink-0"
            >
              Add
            </button>
          </form>

          {/* 1-Click Sample Barcode Simulator Pills (Handy for Instant Laptop/Desktop Testing!) */}
          {sampleProductsWithBarcodes.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>1-Click Test Barcodes (Click to simulate scan):</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sampleProductsWithBarcodes.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleDecodedBarcode(p.barcode)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-blue-400 text-[11px] font-medium text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 shadow-2xs hover:bg-blue-50/50"
                  >
                    <span className="font-bold truncate max-w-[120px]">{p.name}</span>
                    <span className="text-[9px] font-mono text-slate-400">({p.barcode})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
