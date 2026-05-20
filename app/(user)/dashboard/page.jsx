// app/(user)/dashboard/page.jsx
'use client';

import { useState } from 'react';

export default function DashboardPage() {
  // Data dummy user (nantinya diganti dengan data dari Supabase / session)
  const user = {
    username: 'Rey',
    role: 'VIP',
    apiKey: 'XT4-WORLD-99',
    limit: 450,
    maxLimit: 500,
  };

  const [copied, setCopied] = useState(false);

  const copyApiKey = () => {
    navigator.clipboard.writeText(user.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Hitung persentase limit
  const limitPercentage = (user.limit / user.maxLimit) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      {/* Kartu Informasi Pengguna */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Username */}
        <div className="border border-[#333333] rounded-xl bg-[#111111] p-6">
          <p className="text-gray-400 text-sm">Username</p>
          <p className="text-white text-xl font-semibold mt-1">{user.username}</p>
        </div>

        {/* Role */}
        <div className="border border-[#333333] rounded-xl bg-[#111111] p-6">
          <p className="text-gray-400 text-sm">Role</p>
          <p className="text-white text-xl font-semibold mt-1 flex items-center gap-2">
            {user.role}
            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white">
              ⭐ VIP
            </span>
          </p>
        </div>

        {/* API Key */}
        <div className="border border-[#333333] rounded-xl bg-[#111111] p-6">
          <p className="text-gray-400 text-sm">API Key</p>
          <p className="text-white text-sm font-mono mt-1 break-all">{user.apiKey}</p>
        </div>
      </div>

      {/* Limit Usage */}
      <div className="border border-[#333333] rounded-xl bg-[#111111] p-6">
        <div className="flex justify-between items-center mb-3">
          <p className="text-gray-400 text-sm">Penggunaan Limit Bulan Ini</p>
          <p className="text-white text-sm font-mono">
            {user.limit} / {user.maxLimit}
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
          Limit mereset setiap awal bulan. VIP mendapatkan 500 request/bulan.
        </p>
      </div>

      {/* Tombol Aksi */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={copyApiKey}
          className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
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
