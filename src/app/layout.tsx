// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Barlow_Condensed, Inter } from 'next/font/google';
import NavBar from '@/components/NavBar';
const display = Barlow_Condensed({ subsets: ['latin'], weight: ['400','600','700'], variable: '--font-display' });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "All 'Bout That Action Boss!",
  description: 'Flashy ESPN-style league hub',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans bg-bg text-text antialiased">
        <NavBar />
        {children}</body>
    </html>
  );
}
