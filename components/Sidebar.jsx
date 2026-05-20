// components/Sidebar.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { label: 'Home', href: '/' },
  { label: 'Docs', href: '/docs' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Login', href: '/login' },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay gelap untuk mobile (hanya muncul saat sidebar terbuka) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 
          bg-[#111111] border-r border-[#333333]
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header Sidebar + tombol close untuk mobile */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-[#333333]">
          <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-white">
            XT4 API
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
            aria-label="Tutup menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Daftar Menu */}
        <nav className="mt-6 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose} // menutup sidebar di mobile setelah klik
                className={`
                  group flex items-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-white/10 text-white border-l-2 border-white pl-[14px]' // kompensasi border
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent hover:border-white/50 pl-[14px]'
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
