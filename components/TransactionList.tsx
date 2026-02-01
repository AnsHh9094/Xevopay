'use client';

import { Transaction } from '@/hooks/useWallet';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
    if (transactions.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500">
                <Clock className="mx-auto mb-2 opacity-50" />
                <p>No transactions yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white/80">Recent Activity</h3>
            <div className="space-y-3">
                {transactions.map((tx, i) => (
                    <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${tx.type === 'received' ? 'bg-green-500/20 text-green-400' : 'bg-pink-500/20 text-pink-400'}`}>
                                {tx.type === 'received' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                            </div>
                            <div>
                                <p className="text-white font-medium">
                                    {tx.type === 'received' ? 'Received' : 'Sent'}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {new Date(tx.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                        <div className={`font-bold ${tx.type === 'received' ? 'text-green-400' : 'text-white'}`}>
                            {tx.type === 'received' ? '+' : '-'}₹{tx.amount}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
