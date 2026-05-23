'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ApiCard from '../../../components/ApiCard';

export default function DocsPage() {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEndpoints = async () => {
      // Tidak ada pengecekan session – halaman ini 100% public
      const { data, error } = await supabase
        .from('api_endpoints')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Gagal memuat endpoint:', error.message);
      } else if (data) {
        // Parsing kolom params dari JSON/text menjadi array objek
        const parsedData = data.map((ep) => ({
          ...ep,
          params: ep.params
            ? typeof ep.params === 'string'
              ? JSON.parse(ep.params)
              : ep.params
            : [],
        }));
        setApis(parsedData);
      }
      setLoading(false);
    };

    fetchEndpoints();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-text-secondary">
        <h1 className="text-3xl font-bold text-pure-white mb-2">Dokumentasi API</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (apis.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-pure-white mb-2">Dokumentasi API</h1>
        <p className="text-text-secondary">Belum ada API yang tersedia.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-pure-white mb-2">Dokumentasi API</h1>
      <p className="text-text-secondary mb-8">
        Berikut daftar endpoint yang tersedia. Klik pada card untuk melihat detail, parameter, dan contoh penggunaan.
      </p>

      {apis.map((api, idx) => (
        <ApiCard
          key={api.id || idx}
          method={api.method}
          endpoint={api.path}
          description={api.name}
          params={api.params}
          exampleCode={api.example_code}
          responseJson={api.response_example}
        />
      ))}
    </div>
  );
}
