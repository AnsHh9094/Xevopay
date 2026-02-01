# Xevopay

A secure, offline-first peer-to-peer payments application built with Next.js.

> **Created by:** [Ansh Anand (AnsHh9094)](https://github.com/AnsHh9094)  
> **Copyright © 2026 Ansh Anand. All Rights Reserved.**  
>
> 🛑 **WARNING:** This project is strictly protected by copyright law. Unauthorized copying, cloning, modification, distribution, or use of this code for any purpose without explicit written permission from the author is prohibited.

## Features
- **Offline Wallet**: Your balance and transaction history live on your device (Local Storage).
- **Signal-Free Transfers**: Send money by generating a signed QR code. The receiver scans it to claim funds. No internet required.
- **Cross-Platform**: Installable as a PWA on iOS, Android, and Windows.
- **Premium Design**: Cyber-Fintech aesthetic with glassmorphism and animations.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to use Offline
1. **Sender**: Click "Send", enter amount, generate QR.
2. **Receiver**: Click "Receive", scan the sender's QR.
3. **Done**: Funds move instantly.

## Security Note (Prototype)
This is a demonstration of offline P2P UX. In a production environment, this would require:
- Cryptographic signing (ECDSA) instead of simple JSON tokens.
- Double-spend protection (e.g., local state channels or deferred settlement when online).

---
**© 2026 Ansh Anand (AnsHh9094). Xevopay. All Rights Reserved.**

