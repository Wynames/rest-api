'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { username, email, password, confirmPassword } = formData;

    // Validasi sisi klien
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);

    // Kirim data pendaftaran ke Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username, // disimpan di raw_user_meta_data -> dipakai trigger
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Cek jika user sudah ada (email terdaftar), Supabase kadang tidak error
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError('Email sudah terdaftar. Silakan gunakan email lain atau login.');
      setLoading(false);
      return;
    }

    // Berhasil
    setSuccess(
      'Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi akun (jika diperlukan).'
    );
    setLoading(false);

    // Reset form setelah sukses
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      {/* Card Register */}
      <div className="w-full max-w-md rounded-xl border border-[#333333] bg-[#111111] p-8 shadow-2xl">
        {/* Judul */}
        <h1 className="text-2xl font-bold text-white mb-1">Daftar Akun Baru</h1>
        <p className="text-gray-400 text-sm mb-8">
          Isi data di bawah untuk membuat akun XT4 API.
        </p>

        {/* Notifikasi Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Notifikasi Sukses */}
        {success && (
          <div className="mb-4 rounded-lg border border-green-500/30 bg-green-900/20 p-3 text-sm text-green-300">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1.5">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#333333] bg-black px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors focus:border-white focus:ring-1 focus:ring-white"
            />
          </div>

          {/* Email */}
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

          {/* Password */}
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

          {/* Konfirmasi Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
              Konfirmasi Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#333333] bg-black px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors focus:border-white focus:ring-1 focus:ring-white"
            />
          </div>

          {/* Tombol Daftar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-black transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Daftar Akun'}
          </button>
        </form>

        {/* Tautan ke Login */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-medium text-white hover:underline">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
