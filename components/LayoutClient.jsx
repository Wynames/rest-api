// components/LayoutClient.jsx
'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';

export default function LayoutClient({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (menerima state dari sini) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Area konten utama */}
      <div className="flex-1 flex flex-col w-full lg:ml-0">
        {/* Tombol hamburger (hanya mobile) */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-[#1a1a1a] text-gray-400 hover:text-white border border-[#333333]"
          aria-label="Buka menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Konten halaman */}
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
