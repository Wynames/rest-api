// components/ApiCard.jsx
'use client';

import { useState } from 'react';

export default function ApiCard({
  method,
  endpoint,
  description,
  params,
  exampleCode,
  responseJson,
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('params');
  const [copied, setCopied] = useState(false);

  const copyEndpoint = () => {
    navigator.clipboard.writeText(endpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const methodColors = {
    GET: 'bg-emerald-900/40 text-emerald-400 border-emerald-600',
    POST: 'bg-blue-900/40 text-blue-400 border-blue-600',
  };

  return (
    <div className="border border-border-dark rounded-xl bg-card-bg overflow-hidden mb-6 transition-shadow hover:shadow-lg">
      {/* Header Card */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer select-none hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              methodColors[method] || 'bg-gray-800 text-gray-300 border-gray-600'
            }`}
          >
            {method}
          </span>
          <code className="text-sm sm:text-base text-pure-white truncate">{endpoint}</code>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyEndpoint();
            }}
            className="p-2 rounded-md hover:bg-white/10 text-text-secondary hover:text-pure-white transition-colors"
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
          <svg
            className={`w-5 h-5 text-text-secondary transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Body Accordion */}
      {expanded && (
        <div className="border-t border-border-dark">
          <p className="px-5 py-3 text-text-secondary text-sm border-b border-border-dark">
            {description}
          </p>

          {/* Tabs */}
          <div className="flex border-b border-border-dark">
            {['params', 'example', 'response'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium capitalize transition-colors relative ${
                  activeTab === tab ? 'text-pure-white' : 'text-text-secondary hover:text-gray-300'
                }`}
              >
                {tab === 'params' ? 'Params' : tab === 'example' ? 'Example' : 'Response'}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-pure-white" />
                )}
              </button>
            ))}
          </div>

          {/* Konten Tab */}
          <div className="p-5">
            {activeTab === 'params' && (
              <div>
                <table className="w-full text-sm text-left">
                  <thead className="text-text-secondary uppercase text-xs border-b border-border-dark">
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
                        <td className="py-2 text-pure-white font-mono">{param.name}</td>
                        <td className="py-2 text-text-secondary">{param.type}</td>
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
                <div className="mt-6 space-y-3">
                  <h4 className="text-pure-white font-medium text-sm">Coba Endpoint</h4>
                  {params.map((param, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-sm text-text-secondary sm:w-24">{param.name}</label>
                      <input
                        type="text"
                        placeholder={param.example || `Masukkan ${param.name}`}
                        className="flex-1 px-3 py-2 bg-pure-black border border-border-dark rounded-md text-pure-white placeholder-gray-600 focus:outline-none focus:border-pure-white transition-colors text-sm"
                      />
                    </div>
                  ))}
                  <button className="mt-3 px-5 py-2 bg-pure-white text-pure-black rounded-md font-medium text-sm hover:bg-gray-200 transition-colors">
                    Try it!
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'example' && (
              <div className="bg-pure-black rounded-lg border border-border-dark p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300 font-mono"><code>{exampleCode}</code></pre>
              </div>
            )}

            {activeTab === 'response' && (
              <div className="bg-pure-black rounded-lg border border-border-dark p-4 overflow-x-auto">
                <pre className="text-sm text-green-400 font-mono"><code>{responseJson}</code></pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
