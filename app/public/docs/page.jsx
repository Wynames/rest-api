// app/(public)/docs/page.jsx
'use client';

import { useState } from 'react';

// ---------- Komponen EndpointCard (Internal) ----------
function EndpointCard({ method, endpoint, description, params, exampleCode, responseJson }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('params'); // 'params' | 'example' | 'response'
  const [copied, setCopied] = useState(false);

  const copyEndpoint = () => {
    navigator.clipboard.writeText(endpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Badge warna method
  const methodColors = {
    GET: 'bg-emerald-900/40 text-emerald-400 border-emerald-600',
    POST: 'bg-blue-900/40 text-blue-400 border-blue-600',
    // ... bisa ditambah nanti
  };

  return (
    <div className="border border-[#333333] rounded-xl bg-[#1a1a1a] overflow-hidden mb-6 transition-shadow hover:shadow-lg">
      {/* Header Card */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer select-none hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Method Badge */}
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold border ${methodColors[method] || 'bg-gray-800 text-gray-300 border-gray-600'}`}
          >
            {method}
          </span>
          {/* Endpoint URL */}
          <code className="text-sm sm:text-base text-white truncate">{endpoint}</code>
        </div>
        <div className="flex items-center gap-3 ml-4">
          {/* Tombol Copy */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // jangan expand/collapse
              copyEndpoint();
            }}
            className="p-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            aria-label="Salin endpoint"
          >
            {copied ? (
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          {/* Tombol Expand/Collapse */}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Body (Accordion) */}
      {expanded && (
        <div className="border-t border-[#333333]">
          {/* Deskripsi singkat */}
          <p className="px-5 py-3 text-gray-400 text-sm border-b border-[#333333]">
            {description}
          </p>

          {/* Tabs */}
          <div className="flex border-b border-[#333333]">
            {['params', 'example', 'response'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium capitalize transition-colors relative ${
                  activeTab === tab
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab === 'params' ? 'Params' : tab === 'example' ? 'Example' : 'Response'}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white" />
                )}
              </button>
            ))}
          </div>

          {/* Konten Tab */}
          <div className="p-5">
            {/* Tab Params */}
            {activeTab === 'params' && (
              <div>
                <table className="w-full text-sm text-left">
                  <thead className="text-gray-400 uppercase text-xs border-b border-[#333333]">
                    <tr>
                      <th className="pb-2 font-medium">Nama</th>
                      <th className="pb-2 font-medium">Tipe</th>
                      <th className="pb-2 font-medium">Deskripsi</th>
                      <th className="pb-2 font-medium">Wajib</th>
                    </tr>
                  </thead>
                  <tbody>
                    {params.map((param, idx) => (
                      <tr key={idx} className="border-b border-[#2a2a2a] last:border-0">
                        <td className="py-2 text-white font-mono">{param.name}</td>
                        <td className="py-2 text-gray-400">{param.type}</td>
                        <td className="py-2 text-gray-300">{param.description}</td>
                        <td className="py-2">
                          {param.required ? (
                            <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-red-900/30 text-red-400 border border-red-800">
                              REQUIRED
                            </span>
                          ) : (
                            <span className="text-gray-600">opsional</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Input untuk mencoba (sesuai parameter) */}
                <div className="mt-6 space-y-3">
                  <h4 className="text-white font-medium text-sm">Coba Endpoint</h4>
                  {params.map((param, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-sm text-gray-400 sm:w-24">{param.name}</label>
                      <input
                        type="text"
                        placeholder={param.example || `Masukkan ${param.name}`}
                        className="flex-1 px-3 py-2 bg-black border border-[#333333] rounded-md text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors text-sm"
                      />
                    </div>
                  ))}
                  <button className="mt-3 px-5 py-2 bg-white text-black rounded-md font-medium text-sm hover:bg-gray-200 transition-colors">
                    Try it!
                  </button>
                </div>
              </div>
            )}

            {/* Tab Example */}
            {activeTab === 'example' && (
              <div className="bg-black rounded-lg border border-[#333333] p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300 font-mono"><code>{exampleCode}</code></pre>
              </div>
            )}

            {/* Tab Response */}
            {activeTab === 'response' && (
              <div className="bg-black rounded-lg border border-[#333333] p-4 overflow-x-auto">
                <pre className="text-sm text-green-400 font-mono"><code>{responseJson}</code></pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Halaman Utama Docs ----------
export default function DocsPage() {
  // Dummy data untuk beberapa API
  const apis = [
    {
      method: 'GET',
      endpoint: '/api/waifu/cek',
      description: 'Mendapatkan informasi karakter Waifu berdasarkan nama.',
      params: [
        {
          name: 'name',
          type: 'string',
          description: 'Nama karakter yang ingin dicari, misal: "Mikasa"',
          required: true,
          example: 'Mikasa',
        },
      ],
      exampleCode: `fetch('https://xt4-api.vercel.app/api/waifu/cek?name=Mikasa')
  .then(res => res.json())
  .then(data => console.log(data))`,
      responseJson: `{
  "success": true,
  "data": {
    "name": "Mikasa Ackerman",
    "anime": "Attack on Titan",
    "image_url": "https://example.com/mikasa.jpg"
  }
}`,
    },
    {
      method: 'GET',
      endpoint: '/api/downloader/tiktok',
      description: 'Mengunduh video TikTok tanpa watermark berdasarkan URL.',
      params: [
        {
          name: 'url',
          type: 'string',
          description: 'URL video TikTok yang valid, contoh: https://vt.tiktok.com/xxxx',
          required: true,
          example: 'https://vt.tiktok.com/ZSYdF1x2/',
        },
      ],
      exampleCode: `fetch('https://xt4-api.vercel.app/api/downloader/tiktok?url=...')
  .then(res => res.json())
  .then(data => console.log(data.video_url))`,
      responseJson: `{
  "status": "ok",
  "video_url": "https://example.com/video.mp4",
  "title": "Video Lucu"
}`,
    },
    {
      method: 'GET',
      endpoint: '/api/ai/chat',
      description: 'Chat dengan model AI (default GPT-3.5).',
      params: [
        {
          name: 'prompt',
          type: 'string',
          description: 'Teks pertanyaan atau perintah',
          required: true,
          example: 'Halo, siapa namamu?',
        },
        {
          name: 'model',
          type: 'string',
          description: 'Model AI yang digunakan (opsional, default: gpt-3.5)',
          required: false,
          example: 'gpt-4',
        },
      ],
      exampleCode: `fetch('https://xt4-api.vercel.app/api/ai/chat?prompt=Halo')
  .then(res => res.json())
  .then(data => console.log(data.reply))`,
      responseJson: `{
  "reply": "Halo! Saya adalah AI asisten XT4.",
  "model": "gpt-3.5-turbo"
}`,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Dokumentasi API</h1>
      <p className="text-gray-400 mb-8">
        Berikut daftar endpoint yang tersedia. Klik pada card untuk melihat detail, parameter, dan contoh penggunaan.
      </p>

      {/* Render beberapa EndpointCard */}
      {apis.map((api, idx) => (
        <EndpointCard
          key={idx}
          method={api.method}
          endpoint={api.endpoint}
          description={api.description}
          params={api.params}
          exampleCode={api.exampleCode}
          responseJson={api.responseJson}
        />
      ))}
    </div>
  );
}
