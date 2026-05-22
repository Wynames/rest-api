'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function UpgradePage() {
  const [role, setRole] = useState('VIP');
  const [username, setUsername] = useState('');
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
      setLoading(false);
    };
    getSession();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert('Anda harus login terlebih dahulu.');
      return;
    }

    // 1. Insert ke database
    const { error } = await supabase
      .from('upgrade_requests')
      .insert([
        {
          user_id: userId,
          requested_role: role,
          discord_notes: username,
        },
      ]);

    if (error) {
      alert('Gagal mengirim request: ' + error.message);
      return;
    }

    // 2. Panggil webhook internal untuk notifikasi Discord
    try {
      await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          roleTujuan: role,
          catatan: username,
        }),
      });
    } catch (webhookError) {
      console.error('Gagal memanggil webhook:', webhookError);
      // Tidak perlu menghentikan alur utama
    }

    // 3. Tampilkan pesan sukses
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-gray-400">
        Memuat...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-2">Upgrade Role</h1>
      <p className="text-gray-400 mb-8">
        Lakukan transfer sesuai instruksi, lalu kirim bukti pembayaran.
      </p>

      {/* Instruksi Transfer Manual */}
      <div className="border border-[#333333] rounded-xl bg-[#111111] p-6 mb-8">
        <h2 className="text-white font-semibold mb-3">Instruksi Pembayaran</h2>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li>💳 <span className="text-white">Bank BSI</span>: 7123456789 a.n. XT4 API</li>
          <li>📱 <span className="text-white">Dana / Gopay</span>: 081234567890</li>
          <li>💰 Nominal sesuai paket: VIP Rp20.000, Lord Rp50.000, King's Rp120.000</li>
        </ul>
        <p className="text-gray-500 text-xs mt-4">
          * Setelah transfer, isi form di bawah dan unggah screenshot bukti.
        </p>
      </div>

      {/* Form Upload Bukti */}
      {!submitted ? (
        <form onSubmit={handleSubmit} className="border border-[#333333] rounded-xl bg-[#111111] p-6 space-y-6">
          {/* Pilih Role */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Pilih Role Tujuan</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-[#333333] bg-black px-4 py-3 text-white outline-none focus:border-white focus:ring-1 focus:ring-white"
            >
              <option value="VIP">VIP - Rp20.000/bulan</option>
              <option value="Lord">Lord - Rp50.000/bulan</option>
              <option value="King's">King's - Rp120.000/bulan</option>
            </select>
          </div>

          {/* Username / Discord */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Username Discord / Catatan
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Nama akun Discord kamu"
              className="w-full rounded-lg border border-[#333333] bg-black px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-white focus:ring-1 focus:ring-white"
            />
          </div>

          {/* Upload Bukti (hanya UI) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Upload Bukti Transfer (Screenshot)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white file:text-black file:font-medium hover:file:bg-gray-200 file:cursor-pointer"
            />
            {file && <p className="text-xs text-gray-500 mt-1">File: {file.name}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Kirim Bukti Pembayaran
          </button>
        </form>
      ) : (
        <div className="border border-green-600/30 rounded-xl bg-[#111111] p-8 text-center">
          <svg className="w-12 h-12 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">Bukti Berhasil Dikirim!</h3>
          <p className="text-gray-400">
            Tim admin akan memverifikasi pembayaran kamu dalam 1x24 jam. Status upgrade dapat dipantau di halaman ini.
          </p>
        </div>
      )}
    </div>
  );
}
