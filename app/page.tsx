'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, X, CheckCircle, Smartphone, ScanLine, Wifi } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import WalletCard from '@/components/WalletCard';
import TransactionList from '@/components/TransactionList';
import QRScanner from '@/components/QRScanner';
import BankModal from '@/components/BankModal';
import NFCReader from '@/components/NFCReader';

export default function Home() {
  const { wallet, createPaymentToken, receivePayment, isLoaded, addTransaction } = useWallet();
  const [view, setView] = useState<'home' | 'send' | 'receive' | 'nfc_read'>('home');
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankAction, setBankAction] = useState<'topup' | 'withdraw'>('topup');

  const [bankLinked, setBankLinked] = useState<string | undefined>(undefined);

  const [amount, setAmount] = useState('');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{ success: boolean; message?: string } | null>(null);

  const handleGenerate = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return alert("Enter valid amount");
    if (val > wallet.balance) return alert("Insufficient funds");

    const token = createPaymentToken(val);
    setGeneratedToken(token);
  };

  const handleScan = (data: string) => {
    if (scanResult) return;

    setView('home');

    const result = receivePayment(data);
    setScanResult(result);

    setTimeout(() => setScanResult(null), 3000);
  };

  const resetSend = () => {
    setGeneratedToken(null);
    setAmount('');
    setView('home');
  };

  const handleBankConnect = (serviceName: string) => {
    setBankLinked('UPI Verified');
    setShowBankModal(false);

    if (bankAction === 'topup') {
      const amount = 500;
      addTransaction({
        id: 'upi_' + Date.now(),
        type: 'received',
        amount: amount,
        peerId: serviceName,
        timestamp: Date.now(),
        status: 'completed',
        hash: 'upi_verified_sha256'
      });
      setScanResult({ success: true, message: `₹${amount} Added via UPI` });
      setTimeout(() => setScanResult(null), 3000);
    } else {
      if (wallet.balance < 100) {
        setScanResult({ success: false, message: 'Min withdrawal ₹100' });
      } else {
        addTransaction({
          id: 'upi_' + Date.now(),
          type: 'sent',
          amount: 100,
          peerId: serviceName,
          timestamp: Date.now(),
          status: 'completed',
          hash: 'upi_verified_sha256'
        });
        setScanResult({ success: true, message: `₹100 Sent to Bank` });
      }
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  const openBank = (action: 'topup' | 'withdraw') => {
    setBankAction(action);
    setShowBankModal(true);
  };

  if (!isLoaded) return <div className="min-h-screen grid place-items-center bg-[#050511] text-white">Loading Secure Vault...</div>;

  return (
    <main className="layout-container bg-[#050511] min-h-screen text-white pb-20">

      {/* Header */}
      <header className="flex items-center justify-between mb-8 pt-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          XIVOPAY <span className="text-xs text-white/40 border border-white/20 px-1 rounded ml-1">INDIA</span>
        </h1>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-600 border border-white/20 shadow-lg glow animate-pulse" />
      </header>

      {/* Wallet Card */}
      <section className="mb-8">
        <WalletCard
          balance={wallet.balance}
          userId={wallet.userId}
          onTopUp={() => openBank('topup')}
          onWithdraw={() => openBank('withdraw')}
          bankLinked={bankLinked}
        />
      </section>

      {/* Actions */}
      <section className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setView('send')}
          className="glass-button p-4 rounded-2xl flex flex-col items-center justify-center gap-2 group hover:bg-white/10"
        >
          <div className="p-3 rounded-full bg-pink-500/20 text-pink-400 group-hover:scale-110 transition-transform">
            <ArrowUpRight size={24} />
          </div>
          <span className="font-medium">Send</span>
        </button>

        <div className="grid grid-rows-2 gap-2">
          <button
            onClick={() => setView('receive')}
            className="glass-button px-4 rounded-xl flex items-center justify-center gap-3 group hover:bg-white/10"
          >
            <div className="p-1.5 rounded-full bg-green-500/20 text-green-400">
              <ScanLine size={18} />
            </div>
            <span className="font-medium text-sm">Scan QR</span>
          </button>
          <button
            onClick={() => setView('nfc_read')}
            className="glass-button px-4 rounded-xl flex items-center justify-center gap-3 group hover:bg-white/10"
          >
            <div className="p-1.5 rounded-full bg-blue-500/20 text-blue-400">
              <Wifi size={18} />
            </div>
            <span className="font-medium text-sm">Scan NFC</span>
          </button>
        </div>
      </section>

      {/* Transactions */}
      <section>
        <TransactionList transactions={wallet.transactions} />
      </section>

      {/* Success/Error Toast */}
      <AnimatePresence>
        {scanResult && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed bottom-8 left-4 right-4 p-4 rounded-xl flex items-center gap-3 shadow-2xl z-50 ${scanResult.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
          >
            {scanResult.success ? <CheckCircle /> : <X />}
            <div>
              <p className="font-bold">{scanResult.success ? 'Success!' : 'Failed'}</p>
              <p className="text-sm opacity-90">{scanResult.message || 'Funds received successfully.'}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEND MODAL */}
      <AnimatePresence>
        {view === 'send' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
          >
            <div className="bg-[#0b0b1e] w-full max-w-md h-[90vh] sm:h-auto sm:rounded-3xl rounded-t-3xl border border-white/10 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Send Money</h2>
                <button onClick={resetSend} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
              </div>

              {!generatedToken ? (
                /* Input Step */
                <div className="flex-1 flex flex-col justify-center space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Amount to send</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-500">₹</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-10 text-3xl font-bold focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <p className="text-xs text-right text-slate-500">Balance: ₹{wallet.balance.toLocaleString()}</p>
                  </div>

                  <button
                    onClick={handleGenerate}
                    className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-90 transition-opacity"
                  >
                    Generate QR / NFC Token
                  </button>
                </div>
              ) : (
                /* QR Step */
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <div className="bg-white p-4 rounded-xl">
                    <QRCodeSVG value={generatedToken} size={250} />
                  </div>
                  <p className="text-center text-slate-400 text-sm max-w-xs">
                    QR Ready. <br />
                    <span className="text-blue-400 font-bold">Also broadcasting via NFC...</span>
                    <br />Hold receiver's phone close.
                  </p>
                  <div className="bg-yellow-500/10 text-yellow-500 text-xs p-3 rounded-lg border border-yellow-500/20 flex items-center gap-2">
                    <Smartphone size={14} />
                    <span>Funds deducted.</span>
                  </div>
                  <button
                    onClick={resetSend}
                    className="w-full py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCANNER MODALS */}
      {view === 'receive' && <QRScanner onScan={handleScan} onClose={() => setView('home')} />}
      {view === 'nfc_read' && <NFCReader onScan={handleScan} onClose={() => setView('home')} />}

      {/* BANK (UPI) MODAL */}
      <BankModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        onConnect={handleBankConnect}
        mode={bankAction}
      />

    </main>
  );
}
