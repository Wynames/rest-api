// app/layout.jsx

import { Inter } from 'next/font/google';  // font bersih & profesional
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'XT4 API – RESTful Platform',
  description:
    'Platform API modern dengan tema Yin‑Yang. Didukung Next.js & Supabase, siap untuk bot, aplikasi, dan otomatisasi.',
  keywords: ['REST API', 'Next.js', 'Supabase', 'download', 'tools'],
  robots: 'index, follow',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.className}>
      <body className="min-h-screen bg-pure-black text-pure-white antialiased">
        {/* Di sini nantinya akan dimasukkan Navbar / Sidebar sesuai grup rute */}
        {children}
      </body>
    </html>
  );
}
