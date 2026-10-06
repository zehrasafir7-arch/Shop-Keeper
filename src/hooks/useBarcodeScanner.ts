import { useEffect, useRef } from 'react';
import { playBarcodeBeep } from '../lib/audioBeep.js';

interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void;
  enabled?: boolean;
  minBarcodeLength?: number;
  maxKeystrokeIntervalMs?: number;
}

export function useBarcodeScanner({
  onScan,
  enabled = true,
  minBarcodeLength = 3,
  maxKeystrokeIntervalMs = 70, // Barcode guns type faster than 70ms per key
}: UseBarcodeScannerOptions) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing with slow pauses in normal inputs,
      // UNLESS it's a hardware scanner fast burst
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Enter key indicates end of barcode transmission from scanner gun
      if (e.key === 'Enter') {
        const barcode = bufferRef.current.trim();
        bufferRef.current = '';

        if (barcode.length >= minBarcodeLength) {
          // If was typing inside another input, prevent default form submit
          if (isInput && timeDiff < maxKeystrokeIntervalMs * 2) {
            e.preventDefault();
          }
          playBarcodeBeep();
          onScan(barcode);
        }
        return;
      }

      // If keys arrive too slowly (> 120ms between keys), reset buffer
      if (timeDiff > maxKeystrokeIntervalMs * 2.5) {
        bufferRef.current = '';
      }

      // Ignore single modifier keys (Shift, Ctrl, Alt, etc.)
      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, minBarcodeLength, maxKeystrokeIntervalMs, onScan]);
}
