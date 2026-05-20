// app/(admin)/god-mode/page.jsx
export default function GodModePage() {
  // Data dummy statistik
  const stats = [
    { label: 'Total User', value: '1,204' },
    { label: 'Request API Hari Ini', value: '45,892' },
    { label: 'Request Upgrade Tertunda', value: '5' },
  ];

  // Daftar upgrade tertunda (dummy)
  const pendingUpgrades = [
    { id: 1, username: 'darkz', requestedRole: 'VIP', status: 'Menunggu' },
    { id: 2, username: 'lightz', requestedRole: 'Lord', status: 'Menunggu' },
    { id: 3, username: 'venz', requestedRole: "King's", status: 'Menunggu' },
    { id: 4, username: 'reyd', requestedRole: 'VIP', status: 'Menunggu' },
    { id: 5, username: 'xin', requestedRole: 'Lord', status: 'Menunggu' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-10">
      {/* Header Admin */}
      <div>
        <h1 className="text-3xl font-bold text-white">God Mode Dashboard</h1>
        <p className="text-gray-400 mt-1">Panel kontrol utama untuk Administrator.</p>
      </div>

      {/* Kotak Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-[#333333] rounded-xl bg-[#111111] p-6">
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabel Daftar Request Upgrade */}
      <div className="border border-[#333333] rounded-xl bg-[#111111] p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Daftar Request Upgrade Tertunda</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-400 border-b border-[#333333]">
              <tr>
                <th className="pb-3 font-medium">No</th>
                <th className="pb-3 font-medium">Username</th>
                <th className="pb-3 font-medium">Request Role</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {pendingUpgrades.map((item, idx) => (
                <tr key={item.id} className="border-b border-[#2a2a2a] last:border-0">
                  <td className="py-3">{idx + 1}</td>
                  <td className="py-3 text-white">{item.username}</td>
                  <td className="py-3">{item.requestedRole}</td>
                  <td className="py-3">
                    <span className="bg-yellow-500/20 text-yellow-400 text-xs font-medium px-2 py-1 rounded-full">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="text-white hover:underline text-xs font-medium">
                      Proses
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-gray-500 text-xs mt-4">
          * Klik "Proses" untuk menyetujui atau menolak request upgrade.
        </p>
      </div>
    </div>
  );
}
