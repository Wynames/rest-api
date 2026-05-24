'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function GodModePage() {
  const [stats, setStats] = useState({
    totalUser: 0,
    requestToday: 0,
    pendingUpgrade: 0,
  });
  const [pendingUpgrades, setPendingUpgrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch semua data
  const fetchData = async () => {
    setLoading(true);

    // Total user
    const { count: totalUser, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Request API hari ini dari api_logs
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const { count: requestToday, error: logError } = await supabase
      .from('api_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStr);

    // Ambil SEMUA request upgrade (tanpa filter status) untuk debugging
    const { data: upgrades, error: upgradeError } = await supabase
      .from('upgrade_requests')
      .select('*, users(username, email)')
      .order('created_at', { ascending: false });

    if (upgradeError) {
      console.error("Error Fetch Upgrades:", upgradeError);
    }

    if (!countError) {
      setStats((prev) => ({ ...prev, totalUser: totalUser ?? 0 }));
    }
    if (!logError) {
      setStats((prev) => ({ ...prev, requestToday: requestToday ?? 0 }));
    }
    if (!upgradeError && upgrades) {
      setPendingUpgrades(upgrades);
      const pendingCount = upgrades.filter((item) => item.status === 'Menunggu').length;
      setStats((prev) => ({ ...prev, pendingUpgrade: pendingCount }));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (requestId, userId, requestedRole) => {
    const { error } = await supabase.rpc('approve_upgrade', {
      req_id: requestId,
      target_user_id: userId,
      new_role: requestedRole,
    });

    if (error) {
      alert('Gagal memperbarui: ' + error.message);
      return;
    }

    fetchData();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 text-gray-400">
        Memuat data admin...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-10">
      {/* Header Admin */}
      <div>
        <h1 className="text-3xl font-bold text-white">God Mode Dashboard</h1>
        <p className="text-gray-400 mt-1">Panel kontrol utama untuk Administrator.</p>
      </div>

      {/* Kotak Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-[#333333] rounded-xl bg-[#111111] p-6">
          <p className="text-gray-400 text-sm">Total User</p>
          <p className="text-3xl font-bold text-white mt-2">{stats.totalUser}</p>
        </div>
        <div className="border border-[#333333] rounded-xl bg-[#111111] p-6">
          <p className="text-gray-400 text-sm">Request API Hari Ini</p>
          {/* Perbaikan: menampilkan angka asli, bukan placeholder "—" */}
          <p className="text-3xl font-bold text-white mt-2">{stats.requestToday}</p>
        </div>
        <div className="border border-[#333333] rounded-xl bg-[#111111] p-6">
          <p className="text-gray-400 text-sm">Request Upgrade Tertunda</p>
          <p className="text-3xl font-bold text-white mt-2">{stats.pendingUpgrade}</p>
        </div>
      </div>

      {/* Tabel Daftar Request Upgrade */}
      <div className="border border-[#333333] rounded-xl bg-[#111111] p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Daftar Request Upgrade</h2>
        {pendingUpgrades.length === 0 ? (
          <p className="text-gray-500">Tidak ada request upgrade.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-400 border-b border-[#333333]">
                <tr>
                  <th className="pb-3 font-medium">No</th>
                  <th className="pb-3 font-medium">Username / Email</th>
                  <th className="pb-3 font-medium">Discord Notes</th>
                  <th className="pb-3 font-medium">Request Role</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {pendingUpgrades.map((item, idx) => (
                  <tr key={item.id} className="border-b border-[#2a2a2a] last:border-0">
                    <td className="py-3">{idx + 1}</td>
                    <td className="py-3 text-white">
                      {item.users?.username || item.users?.email || 'Tidak diketahui'}
                    </td>
                    <td className="py-3">{item.discord_notes || '-'}</td>
                    <td className="py-3">{item.requested_role}</td>
                    <td className="py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          item.status === 'Menunggu'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : item.status === 'Approved'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {item.status === 'Menunggu' && (
                        <button
                          onClick={() => handleApprove(item.id, item.user_id, item.requested_role)}
                          className="text-white hover:underline text-xs font-medium bg-green-600/20 text-green-400 px-3 py-1 rounded-full hover:bg-green-600/30 transition-colors"
                        >
                          Proses
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-gray-500 text-xs mt-4">
          * Klik &quot;Proses&quot; untuk menyetujui request upgrade. Role dan limit user akan otomatis diperbarui.
        </p>
      </div>
    </div>
  );
}
