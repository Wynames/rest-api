// app/(admin)/god-mode/users/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function GodModeUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, role, limit_harian, status')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditRole(user.role);
    setEditStatus(user.status);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRole('');
    setEditStatus('');
  };

  const handleSaveEdit = async (userId) => {
    const { error } = await supabase.rpc('admin_update_user', {
      target_user_id: userId,
      new_role: editRole,
      new_status: editStatus,
    });

    if (error) {
      alert('Gagal menyimpan: ' + error.message);
      return;
    }
    cancelEdit();
    fetchUsers();
  };

  const handleBan = async (userId) => {
    const { error } = await supabase
      .from('users')
      .update({ status: 'Banned' })
      .eq('id', userId);

    if (error) {
      alert('Gagal melakukan banned: ' + error.message);
      return;
    }
    fetchUsers();
  };

  const handleProcess = async (userId) => {
    const { error } = await supabase
      .from('users')
      .update({ status: 'Active' })
      .eq('id', userId);

    if (error) {
      alert('Gagal memproses: ' + error.message);
      return;
    }
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 text-text-secondary">
        Memuat data pengguna...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 text-red-400">
        Gagal memuat data: {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-pure-white">Manajemen User</h1>
        <p className="text-text-secondary mt-1">
          Kelola seluruh pengguna terdaftar, edit role, terima upgrade, atau banned akun.
        </p>
      </div>

      <div className="border border-border-dark rounded-xl bg-rich-black p-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-text-secondary border-b border-border-dark">
            <tr>
              <th className="pb-3 font-medium">ID</th>
              <th className="pb-3 font-medium">Username</th>
              <th className="pb-3 font-medium">Email</th>
              <th className="pb-3 font-medium">Role</th>
              <th className="pb-3 font-medium">Limit Harian</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-pure-white">
            {users.map((user) => {
              const isEditing = editingId === user.id;
              return (
                <tr
                  key={user.id}
                  className="border-b border-[#2a2a2a] last:border-0 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 text-text-secondary text-xs font-mono">
                    {user.id.substring(0, 8)}...
                  </td>
                  <td className="py-3 font-medium">{user.username}</td>
                  <td className="py-3 text-text-secondary">{user.email}</td>
                  <td className="py-3">
                    {isEditing ? (
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="bg-pure-black border border-border-dark rounded px-2 py-1 text-xs text-pure-white focus:outline-none focus:border-pure-white"
                      >
                        <option value="Free">Free</option>
                        <option value="VIP">VIP</option>
                        <option value="Lord">Lord</option>
                        <option value="King's">King's</option>
                        <option value="admin">Admin</option>
                        <option value="Developer">Developer</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          user.role === "King's"
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : user.role === 'Lord'
                            ? 'bg-purple-500/20 text-purple-400'
                            : user.role === 'VIP'
                            ? 'bg-blue-500/20 text-blue-400'
                            : user.role === 'Developer' || user.role === 'admin'
                            ? 'bg-pink-500/20 text-pink-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-text-secondary">{user.limit_harian}</td>
                  <td className="py-3">
                    {isEditing ? (
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="bg-pure-black border border-border-dark rounded px-2 py-1 text-xs text-pure-white focus:outline-none focus:border-pure-white"
                      >
                        <option value="Active">Active</option>
                        <option value="Banned">Banned</option>
                        <option value="Menunggu">Menunggu</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          user.status === 'Active'
                            ? 'bg-green-500/20 text-green-400'
                            : user.status === 'Menunggu'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {user.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(user.id)}
                            className="px-3 py-1 rounded text-xs font-medium bg-white text-pure-black hover:bg-gray-200 transition-colors"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 rounded text-xs font-medium border border-border-dark text-text-secondary hover:text-pure-white"
                          >
                            Batal
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(user)}
                            className="px-3 py-1 rounded text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
                          >
                            Edit
                          </button>
                          {user.status === 'Menunggu' && (
                            <button
                              onClick={() => handleProcess(user.id)}
                              className="px-3 py-1 rounded text-xs font-medium bg-white text-pure-black hover:bg-gray-200 transition-colors"
                            >
                              PROSES
                            </button>
                          )}
                          <button
                            onClick={() => handleBan(user.id)}
                            disabled={user.status === 'Banned'}
                            className={`px-3 py-1 rounded text-xs font-medium border border-red-500/50 ${
                              user.status === 'Banned'
                                ? 'text-gray-600 cursor-not-allowed'
                                : 'text-red-400 hover:bg-red-500/10 transition-colors'
                            }`}
                          >
                            BANNED
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-text-secondary text-xs">
        * Perubahan role akan otomatis menyesuaikan limit harian melalui trigger database.
      </p>
    </div>
  );
}
