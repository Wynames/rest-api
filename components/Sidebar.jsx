// components/Sidebar.jsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Kelompok menu
const menuGroups = [
  {
    title: 'PUBLIC',
    items: [
      { label: 'Home', href: '/' },
      { label: 'Docs', href: '/docs' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'AUTH',
    items: [
      { label: 'Login', href: '/login' },
      { label: 'Register', href: '/register' },
    ],
  },
  {
    title: 'USER',
    items: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Upgrade Role', href: '/upgrade' },
    ],
  },
  {
    title: 'ADMIN',
    items: [
      { label: 'God-Mode', href: '/god-mode' },
      { label: 'Users', href: '/god-mode/users' },
      { label: 'Add API', href: '/god-mode/apis' },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 
          bg-rich-black border-r border-border-dark
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header + tombol close mobile */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-border-dark">
          <Link href="/" className="text-xl font-bold tracking-tight text-pure-white">
            XT4 API
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded text-text-secondary hover:text-pure-white"
            aria-label="Tutup menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Grup menu */}
        <nav className="mt-6 px-3 space-y-6 overflow-y-auto">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <p className="px-4 mb-2 text-xs font-semibold text-gray-500 tracking-wider">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`
                          group flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                          ${
                            isActive
                              ? 'bg-white/10 text-pure-white border-l-2 border-pure-white pl-[14px]'
                              : 'text-text-secondary hover:text-pure-white hover:bg-white/5 border-l-2 border-transparent hover:border-white/50 pl-[14px]'
                          }
                        `}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
