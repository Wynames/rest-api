'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { email, password } = formData;

    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      if (signInError.message.includes('Invalid login credentials')) {
        setError('Email atau password salah.');
      } else {
        setError(signInError.message);
      }
      setLoading(false);
      return;
    }

    // Login berhasil → redirect & refresh
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-xl border border-[#333333] bg-[#111111] p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-1">Masuk ke Akun</h1>
        <p className="text-gray-400 text-sm mb-8">
          Silakan login untuk melanjutkan ke dashboard.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#333333] bg-black px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors focus:border-white focus:ring-1 focus:ring-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#333333] bg-black px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors focus:border-white focus:ring-1 focus:ring-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-black transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Belum punya akun?{' '}
          <Link href="/register" className="font-medium text-white hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
