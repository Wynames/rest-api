'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function GodModeApisPage() {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Downloader',
    path: '/api/...',
    method: 'GET',
    responseExample: '',
    params: '',
  });
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let parsedParams = null;
    if (formData.params.trim()) {
      try {
        parsedParams = JSON.parse(formData.params);
      } catch (err) {
        alert('Format JSON pada Parameter tidak valid.');
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.from('api_endpoints').insert([
      {
        name: formData.name,
        category: formData.category,
        path: formData.path,
        method: formData.method,
        response_example: formData.responseExample,
        params: parsedParams,
        is_active: true,
      },
    ]);

    if (error) {
      alert('Gagal menambahkan endpoint: ' + error.message);
      setLoading(false);
      return;
    }

    setShowAlert(true);
    setFormData({
      name: '',
      category: 'Downloader',
      path: '/api/...',
      method: 'GET',
      responseExample: '',
      params: '',
    });
    setLoading(false);

    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleAutoGenerate = async () => {
    if (!formData.name || !formData.path || !formData.method) {
      alert('Isi Nama API, Path Endpoint, dan Method terlebih dahulu.');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/admin/generate-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: formData.path,
          method: formData.method,
          description: formData.name,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        alert(json.message || 'AI gagal menghasilkan dokumentasi.');
        return;
      }

      const { params, responseExample } = json.data;
      setFormData((prev) => ({
        ...prev,
        params: JSON.stringify(params, null, 2),
        responseExample: typeof responseExample === 'string' ? responseExample : JSON.stringify(responseExample, null, 2),
      }));
    } catch (err) {
      alert('Gagal menghubungi AI: ' + err.message);
    } finally {
      setIsGeneratingAI(false);
    }
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
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1.5">
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
          <label htmlFor="category" className="block text-sm font-medium text-text-secondary mb-1.5">
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
          <label htmlFor="path" className="block text-sm font-medium text-text-secondary mb-1.5">
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
          <label htmlFor="method" className="block text-sm font-medium text-text-secondary mb-1.5">
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

        {/* Tombol Auto-Generate AI */}
        <div>
          <button
            type="button"
            onClick={handleAutoGenerate}
            disabled={isGeneratingAI}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>✨</span>
            {isGeneratingAI ? 'Menghasilkan...' : 'Auto-Generate dengan AI'}
          </button>
        </div>

        {/* Parameter JSON (Opsional) */}
        <div>
          <label htmlFor="params" className="block text-sm font-medium text-text-secondary mb-1.5">
            Parameter JSON (Opsional)
          </label>
          <textarea
            id="params"
            name="params"
            value={formData.params}
            onChange={handleChange}
            rows={4}
            placeholder='[{"name":"gender","type":"string","description":"...","required":true,"example":"cowo"}]'
            className="w-full rounded-lg border border-border-dark bg-pure-black px-4 py-3 text-pure-white placeholder-gray-600 outline-none transition-colors focus:border-pure-white focus:ring-1 focus:ring-pure-white font-mono text-sm"
          />
          <p className="text-gray-500 text-xs mt-1">
            Isi dengan array JSON yang berisi objek parameter (name, type, description, required, example). Kosongkan jika tidak ada.
          </p>
        </div>

        {/* Contoh Response JSON */}
        <div>
          <label htmlFor="responseExample" className="block text-sm font-medium text-text-secondary mb-1.5">
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
          disabled={loading}
          className="w-full py-3 bg-pure-white text-pure-black font-semibold rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-pure-white focus:ring-offset-2 focus:ring-offset-pure-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Menyimpan...' : 'Tambah Endpoint'}
        </button>
      </form>

      <p className="text-text-secondary text-xs">
        * Penambahan API melalui form ini hanya memperbarui dokumentasi. Implementasi endpoint sesungguhnya tetap dilakukan melalui coding.
      </p>
    </div>
  );
}
