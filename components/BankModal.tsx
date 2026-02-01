'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShieldCheck, ChevronRight, QrCode } from 'lucide-react';
import { useState, useEffect } from 'react';

interface BankModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: (serviceName: string) => void;
    mode: 'topup' | 'withdraw';
}

export default function BankModal({ isOpen, onClose, onConnect, mode }: BankModalProps) {
    const [step, setStep] = useState<'list' | 'success'>('list');
    const [loading, setLoading] = useState(false);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStep('list');
            setLoading(false);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-[#12121a] rounded-t-3xl sm:rounded-2xl border border-white/10 overflow-hidden shadow-2xl h-[85vh] sm:h-[650px] flex flex-col"
                    >
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1a1a24]">
                            <div className="flex items-center gap-2 text-slate-200">
                                <ShieldCheck size={18} className="text-emerald-400" />
                                <span className="font-semibold text-sm">Secure Offline Protocol</span>
                            </div>
                            <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">

                            {/* STEP 1: LOAD CASH or WITHDRAW */}
                            {step === 'list' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                    <div className="text-center space-y-2">
                                        <h2 className="text-2xl font-bold text-white">
                                            {mode === 'topup' ? 'Load Offline Cash' : 'Redeem Cash'}
                                        </h2>
                                        <p className="text-slate-400 text-sm">
                                            {mode === 'topup'
                                                ? 'Enter the 4-digit PIN from your Physical Voucher.'
                                                : 'Show this code to a Xivo Agent to redeem cash.'}
                                        </p>
                                    </div>

                                    {mode === 'topup' ? (
                                        <div className="space-y-4">
                                            <div className="bg-white/5 p-4 rounded-xl text-center border border-white/10">
                                                <input
                                                    type="password"
                                                    placeholder="• • • •"
                                                    className="bg-transparent text-center text-3xl tracking-[1em] w-full focus:outline-none placeholder-slate-600 font-mono text-white"
                                                    maxLength={4}
                                                    onChange={(e) => {
                                                        if (e.target.value.length === 4) {
                                                            setLoading(true);
                                                            setTimeout(() => {
                                                                setLoading(false);
                                                                setStep('success');
                                                                setTimeout(() => onConnect('Offline Voucher'), 1000);
                                                            }, 1500);
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-center text-slate-500">Use default PIN: 1234 (For Demo)</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl">
                                            <QrCode size={180} className="text-black" />
                                            <p className="mt-4 text-black font-bold font-mono">REDEEM-XIVO-{Math.floor(Math.random() * 9000) + 1000}</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* STEP 2: SUCCESS */}
                            {step === 'success' && (
                                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                                        <Check size={48} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        {mode === 'topup' ? 'Cash Loaded Successfully' : 'Redemption Success'}
                                    </h2>
                                    <p className="text-slate-400">
                                        {mode === 'topup'
                                            ? 'Funds added to your offline vault.'
                                            : 'Cash handed over by Agent.'}
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        <div className="p-4 border-t border-white/5 bg-[#1a1a24] text-center">
                            <p className="text-[10px] text-slate-500">Xivopay Offline Cash Protocol v1.0</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
