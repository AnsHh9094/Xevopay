# Xivopay Architecture

## 1. Core Concept: "Hybrid Cash"
Xivopay acts like a digital wallet that holds "Cash". 
- **Online Mode**: Needed ONLY to load the wallet (ATM style) or withdraw to a bank.
- **Offline Mode**: Once funds are in the wallet, they can be moved P2P without any signal, just like handing someone a $20 bill.

## 2. Peer-to-Peer (P2P) Offline Transfer
We use a **Cryptographic Check** embedded in a QR Code.

### Step-by-Step Flow:
1. **User A (Sender)** has $1000 locally.
2. User A types $50 and hits "Send".
3. **App Logic**:
   - Creates a JSON object: `{ amount: 50, sender_id: "UserA", timestamp: 12345, nonce: "random" }`
   - Signs this object with a private key (Digital Signature).
   - Generates a QR code containing this signed token.
   - Deducts $50 from User A's local balance immediately.
4. **User B (Receiver)** hits "Receive" (Camera Opens).
5. User B scans the QR.
6. **App Logic**:
   - Validates the signature (verifies it came from a valid Xivopay wallet).
   - Checks if this "Token ID" has been used before (prevent double-spending *locally*).
   - Adds $50 to User B's local balance.

*Security Note*: In a real production app, when User A eventually goes online, the app syncs with the server to finalize the ledger. If User A hacked their app to "double spend", the server would ban them and revert the transaction.

## 3. Real World Banking (The Gateway)
When you launch **Xivopay**, you will need a Payment Gateway (like Stripe, Plaid, or a local Bank API).

### How it connects:
1. **KYC (Know Your Customer)**: User signs up with Phone/ID.
2. **Link Bank**: User links their Bank Account via API.
3. **Load Wallet (Top Up)**:
   - User clicks "Top Up".
   - App requests $500 from Bank.
   - Bank confirms transfer.
   - App credits $500 to "Offline Vault" (Local Storage).
4. **Withdraw**:
   - User clicks "Withdraw".
   - App checks local balance.
   - App sends request to Bank API to deposit funds.

## 4. Accessibility
Since Xivopay is a **PWA (Progressive Web App)**:
- **Universal**: Works on iPhone (Safari), Android (Chrome), Windows, Mac. A single URL (`xivopay.com`) installs it everywhere.
- **No App Store**: You can bypass App Store fees/approval initially by letting users install directly from the web.
