import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pyments | Offline P2P Wallet",
  description: "Secure, signal-free payments via QR exchange.",
  manifest: "/manifest.json",
  themeColor: "#050511",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <footer style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          padding: "5px",
          textAlign: "center",
          fontSize: "10px",
          color: "rgba(255, 255, 255, 0.3)",
          pointerEvents: "none",
          zIndex: 9999
        }}>
          © 2026 Ansh Anand (AnsHh9094). Xevopay. All Rights Reserved.
        </footer>
      </body>
    </html>
  );
}
