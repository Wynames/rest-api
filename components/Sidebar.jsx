'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true); // state untuk mencegah flicker

  useEffect(() => {
    const checkUser = async () => {
      setLoadingRole(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!error && userData) {
          setUserRole(userData.role);
        } else {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      setLoadingRole(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setUserRole(null);
        setLoadingRole(false);
      } else {
        // ambil ulang role
        supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: userData, error }) => {
            setUserRole(error ? null : userData?.role);
            setLoadingRole(false);
          });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const menuGroups = [];

  menuGroups.push({
    title: 'PUBLIC',
    items: [
      { label: 'Home', href: '/' },
      { label: 'Docs', href: '/docs' },
      { label: 'Pricing', href: '/pricing' },
    ],
  });

  if (!session) {
    menuGroups.push({
      title: 'AUTH',
      items: [
        { label: 'Login', href: '/login' },
        { label: 'Register', href: '/register' },
      ],
    });
  }

  if (session) {
    menuGroups.push({
      title: 'USER',
      items: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Upgrade Role', href: '/upgrade' },
      ],
    });
  }

  // Menampilkan ADMIN jika role yang diperoleh adalah 'admin' (lowercase) atau 'Developer' (sesuaikan data)
  if (session && !loadingRole && (userRole === 'admin' || userRole === 'Developer')) {
    menuGroups.push({
      title: 'ADMIN',
      items: [
        { label: 'God-Mode', href: '/god-mode' },
        { label: 'Users', href: '/god-mode/users' },
        { label: 'Add API', href: '/god-mode/apis' },
      ],
    });
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 
          bg-rich-black border-r border-border-dark
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto
          overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
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

        <nav className="mt-6 px-3 space-y-6">
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
