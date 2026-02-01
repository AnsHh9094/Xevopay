'use client';

import { useState, useEffect } from 'react';
import { Wifi, X, Check, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NFCReaderProps {
    onScan: (data: string) => void;
    onClose: () => void;
}

export default function NFCReader({ onScan, onClose }: NFCReaderProps) {
    const [status, setStatus] = useState<'idle' | 'scanning' | 'reading' | 'error' | 'unsupported'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!('NDEFReader' in window)) {
            setStatus('unsupported');
            return;
        }
        startScanning();
    }, []);

    const startScanning = async () => {
        try {
            setStatus('scanning');
            // @ts-ignore - NDEFReader is experimental
            const ndef = new NDEFReader();
            await ndef.scan();

            ndef.onreading = (event: any) => {
                setStatus('reading');
                const decoder = new TextDecoder();
                for (const record of event.message.records) {
                    // Assuming the text record contains the JSON token
                    const data = decoder.decode(record.data);
                    onScan(data);
                    break; // Just read the first one
                }
            };

            ndef.onreadingerror = () => {
                setStatus('error');
                setErrorMsg("Failed to read NFC Tag. Try holding it closer.");
            };

        } catch (error: any) {
            setStatus('error');
            setErrorMsg(error.message || "NFC Access Denied");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full">
                <X size={24} />
            </button>

            <AnimatePresence mode="wait">
                {status === 'scanning' && (
                    <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                            <span className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                            <span className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse delay-75" />
                            <Wifi size={64} className="text-blue-400 relative z-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Ready to Scan</h2>
                            <p className="text-slate-400">Hold your device near the Sender's phone.</p>
                        </div>
                    </motion.div>
                )}

                {status === 'reading' && (
                    <motion.div key="reading" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-green-400">
                        <Check size={64} className="mx-auto mb-4" />
                        <h2 className="text-xl font-bold">NFC Chip Detected...</h2>
                    </motion.div>
                )}

                {status === 'unsupported' && (
                    <motion.div key="error" className="text-red-400">
                        <Smartphone size={64} className="mx-auto mb-4 opacity-50" />
                        <h2 className="text-xl font-bold text-white">NFC Not Supported</h2>
                        <p className="text-sm mt-2 max-w-xs mx-auto text-slate-400">
                            Your browser or device does not support Web NFC. Please use the QR Code Scanner instead.
                        </p>
                        <div className="mt-4 p-3 bg-white/5 rounded text-xs text-slate-500">
                            Note: Only works on Android (Chrome).
                        </div>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div key="err" className="text-red-400 space-y-4">
                        <h2 className="text-xl font-bold">Scan Failed</h2>
                        <p className="text-sm text-slate-300">{errorMsg}</p>
                        <button onClick={startScanning} className="px-6 py-2 bg-white/10 rounded-full text-white">Retry</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
