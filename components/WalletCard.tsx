'use client';

import { motion } from 'framer-motion';
import { Wallet, CreditCard, WifiOff, RefreshCw, Smartphone, Landmark } from 'lucide-react';
import { useState } from 'react';

interface WalletCardProps {
    balance: number;
    userId: string;
    onTopUp: () => void;
    onWithdraw: () => void;
    bankLinked?: string;
}

export default function WalletCard({ balance, userId, onTopUp, onWithdraw, bankLinked }: WalletCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="relative h-64 w-full perspective-1000 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div
                className="w-full h-full relative preserve-3d transition-all duration-500"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
            >
                {/* FRONT FACE (Balance) */}
                <div className="absolute inset-0 backface-hidden glass-panel p-6 overflow-hidden flex flex-col justify-between bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <WifiOff size={120} />
                    </div>

                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-2 text-slate-400">
                            <div className="p-2 bg-white/5 rounded-lg"><Wallet size={18} /></div>
                            <span className="text-xs font-medium tracking-wide uppercase">Offline Vault</span>
                        </div>
                        {bankLinked && (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                {bankLinked} Linked
                            </div>
                        )}
                    </div>

                    <div className="relative z-10">
                        <h1 className="text-5xl font-bold text-white tracking-tight drop-shadow-lg">
                            ₹{balance.toLocaleString('en-IN')}
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">Available Balance</p>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 gap-3" onClick={e => e.stopPropagation()}>
                        <button onClick={onTopUp} className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                            <RefreshCw size={16} /> Load Cash
                        </button>
                        <button onClick={onWithdraw} className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-bold border border-white/5 transition-all active:scale-95 flex items-center justify-center gap-2">
                            <Landmark size={16} /> Cash Out
                        </button>
                    </div>
                </div>

                {/* BACK FACE (Virtual Card Details) */}
                <div
                    className="absolute inset-0 backface-hidden glass-panel p-6 flex flex-col justify-between bg-gradient-to-br from-[#0f172a] to-[#334155] border border-white/10 shadow-2xl"
                    style={{ transform: 'rotateY(180deg)' }}
                >
                    <div className="flex justify-between items-center opacity-80">
                        <h3 className="text-lg font-bold italic">XIVOPAY</h3>
                        <CreditCard size={24} />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-12 h-8 bg-yellow-500/20 rounded-md border border-yellow-500/40" />
                            <Smartphone size={20} className="text-slate-400" />
                        </div>
                        <p className="text-xl font-mono tracking-widest text-slate-200 shadow-black drop-shadow-md">
                            •••• •••• •••• {userId.slice(-4)}
                        </p>
                    </div>

                    <div className="flex justify-between items-end text-xs text-slate-400">
                        <div>
                            <p className="uppercase text-[10px]">Card Holder</p>
                            <p className="text-white font-medium text-sm">ANONYMOUS USER</p>
                        </div>
                        <div>
                            <p className="uppercase text-[10px]">Expires</p>
                            <p className="text-white font-medium text-sm">12/30</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// Add CSS for 3D Flip
// .perspective-1000 { perspective: 1000px; }
// .preserve-3d { transform-style: preserve-3d; }
// .backface-hidden { backface-visibility: hidden; }
