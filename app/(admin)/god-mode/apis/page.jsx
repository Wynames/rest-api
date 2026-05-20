// app/(admin)/god-mode/apis/page.jsx
'use client';

import { useState } from 'react';

export default function GodModeApisPage() {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Downloader',
    path: '/api/...',
    method: 'GET',
    responseExample: '',
  });
  const [showAlert, setShowAlert] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulasi penyimpanan data dummy
    setShowAlert(true);
    // Reset form
    setFormData({
      name: '',
      category: 'Downloader',
      path: '/api/...',
      method: 'GET',
      responseExample: '',
    });
    // Sembunyikan alert setelah 3 detik
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-pure-white">Tambah Menu API Baru</h1>
        <p className="text-text-secondary mt-1">
          Form ini memungkinkan admin menambahkan dokumentasi endpoint baru ke sistem secara langsung.
        </p>
      </div>

      {showAlert && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-pure-white">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-medium">Sukses menambahkan API baru ke daftar menu!</p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border border-border-dark rounded-xl bg-rich-black p-6 space-y-6"
      >
        {/* Nama API */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            Nama API
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="contoh: TikTok Downloader"
            className="w-full rounded-lg border border-border-dark bg-pure-black px-4 py-3 text-pure-white placeholder-gray-600 outline-none transition-colors focus:border-pure-white focus:ring-1 focus:ring-pure-white"
          />
        </div>

        {/* Kategori */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            Kategori
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-lg border border-border-dark bg-pure-black px-4 py-3 text-pure-white outline-none focus:border-pure-white focus:ring-1 focus:ring-pure-white"
          >
            <option value="Downloader">Downloader</option>
            <option value="Fun">Fun</option>
            <option value="AI">AI</option>
            <option value="Tools">Tools</option>
          </select>
        </div>

        {/* Path Endpoint */}
        <div>
          <label
            htmlFor="path"
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            Path Endpoint
          </label>
          <input
            id="path"
            name="path"
            type="text"
            value={formData.path}
            onChange={handleChange}
            required
            placeholder="/api/downloader/tiktok"
            className="w-full rounded-lg border border-border-dark bg-pure-black px-4 py-3 text-pure-white placeholder-gray-600 outline-none transition-colors focus:border-pure-white focus:ring-1 focus:ring-pure-white"
          />
        </div>

        {/* Method */}
        <div>
          <label
            htmlFor="method"
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            Method
          </label>
          <select
            id="method"
            name="method"
            value={formData.method}
            onChange={handleChange}
            className="w-full rounded-lg border border-border-dark bg-pure-black px-4 py-3 text-pure-white outline-none focus:border-pure-white focus:ring-1 focus:ring-pure-white"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>

        {/* Contoh Response JSON */}
        <div>
          <label
            htmlFor="responseExample"
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            Contoh Response JSON
          </label>
          <textarea
            id="responseExample"
            name="responseExample"
            value={formData.responseExample}
            onChange={handleChange}
            rows={6}
            placeholder='{ "success": true, "data": {...} }'
            className="w-full rounded-lg border border-border-dark bg-pure-black px-4 py-3 text-pure-white placeholder-gray-600 outline-none transition-colors focus:border-pure-white focus:ring-1 focus:ring-pure-white font-mono text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-pure-white text-pure-black font-semibold rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-pure-white focus:ring-offset-2 focus:ring-offset-pure-black"
        >
          Tambah Endpoint
        </button>
      </form>

      <p className="text-text-secondary text-xs">
        * Penambahan API melalui form ini hanya memperbarui dokumentasi. Implementasi endpoint sesungguhnya tetap dilakukan melalui coding.
      </p>
    </div>
  );
}
