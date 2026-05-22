'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // 'success' | 'error' | ''

  const getMaxLimit = (role) => {
    switch (role) {
      case 'Free': return 60;
      case 'VIP': return 500;
      case 'Lord': return 1500;
      case "King's": return 5000;
      case 'Developer': return 999999999;
      default: return 60;
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const userId = session.user.id;

      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('username, role, limit_harian')
        .eq('id', userId)
        .single();

      if (userError || !userRow) {
        console.error('Gagal mengambil data user:', userError?.message);
        setUserData({ username: session.user.email, role: 'Free', limitHarian: 0 });
      } else {
        setUserData({ username: userRow.username, role: userRow.role, limitHarian: userRow.limit_harian });
      }

      const { data: existingKeys, error: keyError } = await supabase
        .from('api_keys')
        .select('api_key')
        .eq('user_id', userId)
        .limit(1);

      if (keyError) {
        console.error('Gagal mengambil API key:', keyError.message);
      } else if (existingKeys && existingKeys.length > 0) {
        setApiKey(existingKeys[0].api_key);
        setCustomKeyInput(existingKeys[0].api_key); // isi input dengan key saat ini
      } else {
        const newApiKey = `XT4-${userId.substring(0, 8)}-${Date.now().toString(36)}`;
        const { error: insertError } = await supabase
          .from('api_keys')
          .insert([{ user_id: userId, api_key: newApiKey, is_custom: false }]);

        if (!insertError) {
          setApiKey(newApiKey);
          setCustomKeyInput(newApiKey);
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

  const handleSaveCustomKey = async () => {
    if (!userData || !customKeyInput.trim()) return;
    setSaveStatus('');

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    const { error } = await supabase
      .from('api_keys')
      .update({ api_key: customKeyInput.trim(), is_custom: true })
      .eq('user_id', userId);

    if (error) {
      setSaveStatus('error');
      console.error('Gagal menyimpan API key:', error.message);
    } else {
      setApiKey(customKeyInput.trim());
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const canCustomize = userData && userData.role !== 'Free';

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

  const maxLimit = getMaxLimit(userData.role);
  const limitPercentage = Math.min((userData.limitHarian / maxLimit) * 100, 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      {/* Kartu Informasi Pengguna */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-[#333333] rounded-xl bg-[#111111] p-6">
          <p className="text-gray-400 text-sm">Username</p>
          <p className="text-white text-xl font-semibold mt-1">{userData.username}</p>
        </div>

        <div className="border border-[#333333] rounded-xl bg-[#111111] p-6">
          <p className="text-gray-400 text-sm">Role</p>
          <p className="text-white text-xl font-semibold mt-1 flex items-center gap-2">
            {userData.role}
            {userData.role !== 'Free' && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white">
                {userData.role === 'VIP' ? '⭐ VIP' : userData.role === 'Lord' ? '👑 Lord' : userData.role === "King's" ? '🤴 King\'s' : '⚡ Dev'}
              </span>
            )}
          </p>
        </div>

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
        <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-[#333333]">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${limitPercentage}%` }}
          />
        </div>
        <p className="text-gray-500 text-xs mt-2">
          {userData.role === 'Developer'
            ? 'Developer tidak memiliki batasan limit.'
            : 'Limit mereset setiap awal hari. Upgrade ke VIP untuk limit lebih besar.'}
        </p>
      </div>

      {/* Custom API Key Section */}
      <div className="border border-[#333333] rounded-xl bg-[#111111] p-6">
        <h2 className="text-white font-semibold mb-3">Custom API Key</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={customKeyInput}
            onChange={(e) => setCustomKeyInput(e.target.value)}
            disabled={!canCustomize}
            placeholder={canCustomize ? 'Masukkan API Key kustom' : 'Hanya untuk VIP ke atas'}
            className={`flex-1 px-4 py-3 bg-black border border-[#333333] rounded-lg text-white placeholder-gray-600 outline-none focus:border-white focus:ring-1 focus:ring-white ${
              !canCustomize ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
          <button
            onClick={handleSaveCustomKey}
            disabled={!canCustomize}
            className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Simpan Key Baru
          </button>
        </div>
        {!canCustomize && (
          <p className="text-gray-500 text-xs mt-2">Upgrade ke VIP untuk Custom API Key.</p>
        )}
        {saveStatus === 'success' && (
          <div className="mt-3 text-green-400 text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            API Key berhasil diperbarui!
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="mt-3 text-red-400 text-sm">Gagal menyimpan API Key. Silakan coba lagi.</div>
        )}
      </div>

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
