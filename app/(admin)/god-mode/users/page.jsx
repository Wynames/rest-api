// app/(admin)/god-mode/users/page.jsx
'use client';

import { useState } from 'react';

export default function GodModeUsersPage() {
  // Dummy data user
  const initialUsers = [
    {
      id: 1,
      username: 'rey',
      email: 'rey@example.com',
      role: 'King\'s',
      status: 'Active',
    },
    {
      id: 2,
      username: 'lightz',
      email: 'lightz@mail.com',
      role: 'Free',
      status: 'Active',
    },
    {
      id: 3,
      username: 'darkz',
      email: 'darkz@mail.com',
      role: 'Free',
      status: 'Menunggu', // Menunggu konfirmasi upgrade
    },
    {
      id: 4,
      username: 'venz',
      email: 'venz@mail.com',
      role: 'VIP',
      status: 'Active',
    },
    {
      id: 5,
      username: 'xin',
      email: 'xin@mail.com',
      role: 'Lord',
      status: 'Active',
    },
    {
      id: 6,
      username: 'nova',
      email: 'nova@mail.com',
      role: 'Free',
      status: 'Menunggu',
    },
  ];

  const [users, setUsers] = useState(initialUsers);

  // Handler untuk aksi BANNED (hanya ubah status menjadi Banned secara lokal)
  const handleBan = (userId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, status: 'Banned' } : user
      )
    );
  };

  // Handler untuk aksi PROSES (ubah status Menunggu menjadi Active, simulasi ACC)
  const handleProcess = (userId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, status: 'Active' } : user
      )
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-pure-white">Manajemen User</h1>
        <p className="text-text-secondary mt-1">
          Kelola seluruh pengguna terdaftar, terima upgrade, atau banned akun.
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
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-pure-white">
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-[#2a2a2a] last:border-0 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 text-text-secondary">{user.id}</td>
                <td className="py-3 font-medium">{user.username}</td>
                <td className="py-3 text-text-secondary">{user.email}</td>
                <td className="py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      user.role === "King's"
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : user.role === 'Lord'
                        ? 'bg-purple-500/20 text-purple-400'
                        : user.role === 'VIP'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="py-3">
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
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-text-secondary text-xs">
        * Data di atas merupakan simulasi dummy. Integrasi dengan database nyata dilakukan pada tahap produksi.
      </p>
    </div>
  );
}
