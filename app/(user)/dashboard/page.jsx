'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      // 1. Cek session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const userId = session.user.id;

      // 2. Ambil data user dari tabel public.users
      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('username, role, limit_harian')
        .eq('id', userId)
        .single();

      if (userError || !userRow) {
        console.error('Gagal mengambil data user:', userError?.message);
        // fallback jika ada masalah
        setUserData({
          username: session.user.email,
          role: 'Free',
          limitHarian: 0,
        });
      } else {
        setUserData({
          username: userRow.username,
          role: userRow.role,
          limitHarian: userRow.limit_harian,
        });
      }

      // 3. Ambil atau buat API key
      const { data: existingKeys, error: keyError } = await supabase
        .from('api_keys')
        .select('api_key')
        .eq('user_id', userId)
        .limit(1);

      if (keyError) {
        console.error('Gagal mengambil API key:', keyError.message);
      } else if (existingKeys && existingKeys.length > 0) {
        // API key sudah ada
        setApiKey(existingKeys[0].api_key);
      } else {
        // Belum ada → buatkan otomatis dengan format unik
        const newApiKey = `XT4-${userId.substring(0, 8)}-${Date.now().toString(36)}`;
        const { error: insertError } = await supabase
          .from('api_keys')
          .insert([{ user_id: userId, api_key: newApiKey, is_custom: false }]);

        if (!insertError) {
          setApiKey(newApiKey);
        } else {
          console.error('Gagal membuat API key:', insertError.message);
        }
      }

      setLoading(false);
    };

    loadDashboard();
  }, [router]);

  const copyApiKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <p className="text-gray-400">Memuat dashboard...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <p className="text-red-400">Gagal memuat data pengguna. Silakan login kembali.</p>
      </div>
    );
  }

  // Hitung persentase limit (maks 1000 request untuk user biasa, sesuaikan nanti)
  const maxLimit = 1000; // bisa disesuaikan per role
  const limitPercentage = Math.min((userData.limitHarian / maxLimit) * 100, 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      {/* Kartu Informasi Pengguna */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Username */}
        <div className="border border-[#333333] rounded-xl bg-[#111111] p-6">
          <p className="text-gray-400 text-sm">Username</p>
          <p className="text-white text-xl font-semibold mt-1">{userData.username}</p>
        </div>

        {/* Role */}
        <div className="border border-[#333333] rounded-xl bg-[#111111] p-6">
          <p className="text-gray-400 text-sm">Role</p>
          <p className="text-white text-xl font-semibold mt-1 flex items-center gap-2">
            {userData.role}
            {userData.role === 'VIP' && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white">
                ⭐ VIP
              </span>
            )}
          </p>
        </div>

        {/* API Key */}
        <div className="border border-[#333333] rounded-xl bg-[#111111] p-6">
          <p className="text-gray-400 text-sm">API Key</p>
          <p className="text-white text-sm font-mono mt-1 break-all">
            {apiKey || 'Belum tersedia'}
          </p>
        </div>
      </div>

      {/* Limit Usage */}
      <div className="border border-[#333333] rounded-xl bg-[#111111] p-6">
        <div className="flex justify-between items-center mb-3">
          <p className="text-gray-400 text-sm">Penggunaan Limit Harian</p>
          <p className="text-white text-sm font-mono">
            {userData.limitHarian} / {maxLimit}
          </p>
        </div>
        {/* Progress bar */}
        <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-[#333333]">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${limitPercentage}%` }}
          />
        </div>
        <p className="text-gray-500 text-xs mt-2">
          Limit mereset setiap awal hari. Upgrade ke VIP untuk limit lebih besar.
        </p>
      </div>

      {/* Tombol Aksi */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={copyApiKey}
          disabled={!apiKey}
          className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copied ? '✓ Tersalin!' : 'Copy API Key'}
        </button>
        <a
          href="/pricing"
          className="px-6 py-3 border border-white text-white rounded-lg font-semibold hover:bg-white hover:text-black transition-colors"
        >
          Upgrade Role
        </a>
      </div>
    </div>
  );
}
