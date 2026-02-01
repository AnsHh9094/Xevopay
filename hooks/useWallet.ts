'use client';

import { useState, useEffect } from 'react';
import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';
import SHA256 from 'crypto-js/sha256';

export type Transaction = {
    id: string; // Unique GUID
    type: 'sent' | 'received';
    amount: number;
    peerId?: string;
    timestamp: number;
    status: 'completed' | 'pending';
    hash?: string; // Integrity check
};

export type WalletState = {
    balance: number;
    transactions: Transaction[];
    userId: string;
    nonce: number; // Prevent Replay Attacks
    lastUpdated: number;
};

// SECRET ENCRYPTION KEY (In prod, this comes from Server/KMS)
const VAULT_KEY = "XIVOPAY_TOP_SECRET_VAULT_KEY_2026";
const STORAGE_KEY = 'xivopay_vault_v2_secure';

export function useWallet() {
    const [wallet, setWallet] = useState<WalletState>({
        balance: 0,
        transactions: [],
        userId: '',
        nonce: 0,
        lastUpdated: Date.now()
    });

    const [isLoaded, setIsLoaded] = useState(false);

    // --- SECURE LOAD ---
    useEffect(() => {
        const encryptedData = localStorage.getItem(STORAGE_KEY);
        if (encryptedData) {
            try {
                // Decrypt the vault
                const bytes = AES.decrypt(encryptedData, VAULT_KEY);
                const decryptedStr = bytes.toString(encUtf8);

                if (!decryptedStr) throw new Error("Tampering Detected");

                const parsed = JSON.parse(decryptedStr);
                setWallet(parsed);
            } catch (e) {
                console.error('Core Breach: Failed to decrypt wallet. Resetting.', e);
                // Fallback: Wipe wallet for security if corrupted
                const newId = 'user_' + SHA256(Math.random().toString()).toString().substr(0, 12);
                setWallet({
                    balance: 1000, // Airdrop
                    transactions: [],
                    userId: newId,
                    nonce: 0,
                    lastUpdated: Date.now()
                });
            }
        } else {
            // New User
            const newId = 'user_' + SHA256(Math.random().toString()).toString().substr(0, 12);
            setWallet(prev => ({ ...prev, userId: newId, balance: 1000 }));
        }
        setIsLoaded(true);
    }, []);

    // --- SECURE SAVE ---
    useEffect(() => {
        if (isLoaded) {
            // Encrypt before saving to localStorage
            const cipherText = AES.encrypt(JSON.stringify(wallet), VAULT_KEY).toString();
            localStorage.setItem(STORAGE_KEY, cipherText);
        }
    }, [wallet, isLoaded]);

    const addTransaction = (tx: Transaction) => {
        setWallet(prev => {
            const newBalance = tx.type === 'received' ? prev.balance + tx.amount : prev.balance - tx.amount;
            return {
                ...prev,
                balance: newBalance,
                nonce: prev.nonce + 1,
                transactions: [tx, ...prev.transactions],
                lastUpdated: Date.now()
            };
        });
    };

    const createPaymentToken = (amount: number) => {
        if (wallet.balance < amount) return null;

        const txId = SHA256(wallet.userId + Date.now() + Math.random()).toString().substr(0, 16);
        const nonce = wallet.nonce + 1;

        const signaturePayload = `${txId}:${amount}:${wallet.userId}:${nonce}`;
        const signature = SHA256(signaturePayload + VAULT_KEY).toString();

        const uri = `xivopay://pay?pa=${wallet.userId}&am=${amount}&id=${txId}&no=${nonce}&sig=${signature}`;

        addTransaction({
            id: txId,
            type: 'sent',
            amount,
            timestamp: Date.now(),
            status: 'completed',
            hash: signature
        });

        return uri;
    };



    const receivePayment = (tokenUri: string) => {
        try {
            console.log("Processing Scan:", tokenUri);

            // Check Scheme
            if (!tokenUri.startsWith('xivopay://')) {
                throw new Error("Invalid Format. Please scan Xivopay QR.");
            }

            // Parse URL params
            const url = new URL(tokenUri.replace('xivopay://', 'https://placeholder.com/'));
            const params = new URLSearchParams(url.search);

            const token = {
                senderId: params.get('pa'),
                amount: parseFloat(params.get('am') || '0'),
                id: params.get('id'),
                nonce: parseInt(params.get('no') || '0'),
                signature: params.get('sig')
            };

            // 1. Structure Validation
            if (!token.amount || !token.id || !token.senderId || !token.signature) throw new Error("Invalid Token Structure");

            // 2. Prevent Double Spending (Crucial for Offline Cash)
            // If the transaction ID exists in history, it means this "Digital Note" was already spent.
            const exists = wallet.transactions.find(t => t.id === token.id);
            if (exists) {
                console.warn("Double Spend Attempt Blocked:", token.id);
                return { success: false, message: '❌ Invalid: This QR token has already been claimed!' };
            }

            // 3. Verify Signature (Integrity Check)
            // Recalculate hash to ensure Amount hasn't been modified
            const expectedPayload = `${token.id}:${token.amount}:${token.senderId}:${token.nonce}`;
            const expectedSig = SHA256(expectedPayload + VAULT_KEY).toString();

            if (token.signature !== expectedSig) {
                return { success: false, message: 'Security Alert: Invalid Digital Signature' };
            }

            addTransaction({
                id: token.id,
                type: 'received',
                amount: token.amount,
                peerId: token.senderId,
                timestamp: Date.now(),
                status: 'completed',
                hash: token.signature
            });

            return { success: true };
        } catch (e) {
            console.error("QR Parse Error:", e);
            return { success: false, message: 'Invalid QR Format' };
        }
    };

    return {
        wallet,
        isLoaded,
        createPaymentToken,
        receivePayment,
        addTransaction
    };
}
