'use client';

import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface QRScannerProps {
    onScan: (data: string) => void;
    onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
    const [error, setError] = useState<string>('');
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Initialize scanner
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                aspectRatio: 1.0
            },
            false
        );

        scannerRef.current = scanner;

        scanner.render(
            (decodedText) => {
                console.log("Scanned Raw Data:", decodedText);
                onScan(decodedText);
            },
            (errorMessage) => {
                // Ignore frame errors
            }
        );

        return () => {
            // Cleanup
            scannerRef.current?.clear().catch(console.error);
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white z-50 hover:bg-white/20"
            >
                <X size={24} />
            </button>

            <h2 className="text-white mb-4 text-xl font-bold">Scan Payment QR</h2>

            {/* 1. Main Action: Upload Image (Since Camera is blocked) */}
            <div className="w-full max-w-md bg-[#1a1a24] rounded-xl p-6 border border-white/20 text-center mb-6">
                <div id="reader" className="hidden" /> {/* Hidden Camera Reader */}

                <h3 className="text-white font-bold text-lg mb-2">📸 Camera Blocked by Browser</h3>
                <p className="text-slate-400 text-sm mb-4">
                    Browsers block cameras on insecure (HTTP) local Wi-Fi connections.
                </p>

                <label className="block w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold cursor-pointer transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                const file = e.target.files[0];
                                // Init scanner just for file
                                import('html5-qrcode').then(({ Html5Qrcode }) => {
                                    const rawScanner = new Html5Qrcode("reader-file-temp");
                                    rawScanner.scanFile(file, true)
                                        .then(decodedText => onScan(decodedText))
                                        .catch(err => alert("Could not read QR from image. Try a clearer screenshot."));
                                });
                            }
                        }}
                    />
                    <span className="flex items-center justify-center gap-2">
                        📁 Upload QR Screenshot
                    </span>
                </label>
                <div id="reader-file-temp" className="hidden"></div>
            </div>

            {/* 2. Optional: Advanced Fix Instructions */}
            <details className="w-full max-w-md text-left bg-black/50 p-4 rounded-xl border border-white/5">
                <summary className="text-slate-400 text-xs font-bold cursor-pointer hover:text-white">
                    Want to enable the Camera? (Advanced)
                </summary>
                <div className="mt-3 text-slate-400 text-[10px] space-y-2 font-mono">
                    <p>1. Open Chrome on Phone</p>
                    <p>2. Go to: <span className="text-yellow-400">chrome://flags</span></p>
                    <p>3. Search: <span className="text-yellow-400">unsafely-treat-insecure-origin-as-secure</span></p>
                    <p>4. Enable & Add: <span className="text-white select-all">http://192.168.1.2:3000</span></p>
                    <p>5. Relaunch Chrome</p>
                </div>
            </details>

            <p className="text-slate-400 mt-6 text-sm text-center">
                Point your camera at the sender's QR code to receive funds securely offline.
            </p>

            {/* Custom Global CSS for the scanner to hide standard UI elements if desired */}
            <style jsx global>{`
        #reader__dashboard_section_csr span { display: none !important; }
        #reader__dashboard_section_swaplink { display: none !important; }
      `}</style>
        </div>
    );
}
