// app/layout.jsx
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import LayoutClient from '../components/LayoutClient';

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'] });

export const metadata = {
  title: 'XT4 API – RESTful Platform',
  description:
    'Platform API modern dengan tema Yin‑Yang. Didukung Next.js & Supabase, siap untuk bot, aplikasi, dan otomatisasi.',
  keywords: ['REST API', 'Next.js', 'Supabase', 'download', 'tools'],
  robots: 'index, follow',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={jetbrainsMono.className}>
      <body className="min-h-screen bg-black text-white antialiased">
        {/* Komponen client yang membungkus Sidebar + konten */}
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
