'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const publicLinks = [
  { label: 'Home', href: '/' },
  { label: 'Docs', href: '/docs' },
  { label: 'Pricing', href: '/pricing' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek session awal
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileOpen(false);
    router.push('/');
  };

  // Jangan tampilkan apa-apa sebelum loading selesai untuk menghindari flicker
  if (loading) {
    return (
      <nav className="sticky top-0 z-50 bg-black/70 backdrop-blur-md border-b border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <span className="text-gray-400 text-sm">Memuat...</span>
        </div>
      </nav>
    );
  }

  const isLoggedIn = !!session;

  return (
    <nav className="sticky top-0 z-50 bg-black/70 backdrop-blur-md border-b border-border-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-pure-white tracking-tight">
            XT4 API
          </Link>

          {/* Menu Desktop - Tengah */}
          <div className="hidden md:flex items-center space-x-8">
            {publicLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-pure-white border-b-2 border-pure-white pb-1'
                      : 'text-text-secondary hover:text-pure-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Tombol Kanan (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg border border-pure-white text-pure-white text-sm font-medium hover:bg-pure-white hover:text-pure-black transition-all"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg border border-red-500 text-red-400 text-sm font-medium hover:bg-red-500/10 hover:text-red-300 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg border border-pure-white text-pure-white text-sm font-medium hover:bg-pure-white hover:text-pure-black transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg bg-pure-white text-pure-black text-sm font-medium hover:bg-gray-200 transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Tombol Hamburger (Mobile) */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md text-text-secondary hover:text-pure-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border-dark bg-rich-black">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block py-2 text-base font-medium ${
                  pathname === link.href ? 'text-pure-white' : 'text-text-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col space-y-3 pt-4 border-t border-border-dark">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center px-4 py-2 rounded-lg border border-pure-white text-pure-white text-sm font-medium hover:bg-pure-white hover:text-pure-black"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center px-4 py-2 rounded-lg border border-red-500 text-red-400 text-sm font-medium hover:bg-red-500/10 hover:text-red-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center px-4 py-2 rounded-lg border border-pure-white text-pure-white text-sm font-medium hover:bg-pure-white hover:text-pure-black"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center px-4 py-2 rounded-lg bg-pure-white text-pure-black text-sm font-medium hover:bg-gray-200"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
