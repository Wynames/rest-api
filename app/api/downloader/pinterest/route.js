import axios from 'axios';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ======================= SUPABASE ADMIN =======================
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ======================= PINTEREST DOWNLOADER HELPER =======================
async function fetchPinterestMedia(url) {
  // Validasi URL Pinterest
  if (!url || (!url.includes('pin.it') && !url.includes('pinterest.com'))) {
    throw new Error('URL harus dari Pinterest (pin.it atau pinterest.com)');
  }

  // Panggil API savepinmedia.com
  const response = await axios.get(
    `https://savepinmedia.com/php/api/api.php?url=${encodeURIComponent(url)}`,
    {
      headers: {
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }
  );

  const html = response.data;
  if (!html || !html.includes('button-download')) {
    throw new Error('Gagal mengambil data dari server downloader');
  }

  // Ekstrak informasi
  const authorMatch = html.match(/<span>Penulis:<a[^>]*>(.*?)<\/a><\/span>/);
  const mediaIds = [...html.matchAll(/href="\/download\.php\?id=([^"]+)"/g)].map(m => m[1]);

  if (mediaIds.length === 0) {
    throw new Error('Tidak ada media ditemukan');
  }

  // Tentukan tipe (video/gambar)
  const type = html.includes('.mp4') || (html.includes('fa-file-video-o') && !html.includes('JPEG')) ? 'video' : 'image';

  // Bangun URL download lengkap
  const downloadLinks = mediaIds.map(id => `https://savepinmedia.com/download.php?id=${id}`);

  return {
    type,
    title: '-', // Title tidak tersedia di response
    author: authorMatch ? authorMatch[1].trim() : '-',
    media: downloadLinks,
    pinterest_url: url
  };
}

// ======================= API ROUTE HANDLER (GET) =======================
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apikey = searchParams.get('apikey');
  const url = searchParams.get('url');

  // 1. Validasi API Key
  if (!apikey) {
    return NextResponse.json(
      { success: false, message: 'API Key wajib disertakan (?apikey=...)' },
      { status: 401 }
    );
  }

  // 2. Ambil user_id sekali untuk log
  const { data: keyData } = await supabaseAdmin
    .from('api_keys')
    .select('user_id')
    .eq('api_key', apikey)
    .maybeSingle();
  const userId = keyData?.user_id || null;

  const insertLog = async (statusCode) => {
    if (!userId) return;
    await supabaseAdmin.from('api_logs').insert([
      {
        user_id: userId,
        endpoint: '/api/downloader/pinterest',
        method: 'GET',
        status_code: statusCode
      }
    ]);
  };

  // 3. Decrement limit
  const { data: isSuccess, error: rpcError } = await supabaseAdmin.rpc(
    'decrement_api_limit',
    { api_key_input: apikey }
  );

  if (rpcError) {
    console.error('RPC error:', rpcError.message);
    await insertLog(500);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan internal.' },
      { status: 500 }
    );
  }

  if (!isSuccess) {
    await insertLog(403);
    return NextResponse.json(
      { success: false, message: 'API Key tidak valid atau limit habis.' },
      { status: 403 }
    );
  }

  // 4. Validasi parameter URL
  if (!url) {
    await insertLog(400);
    return NextResponse.json(
      { success: false, message: 'Parameter url wajib diisi.' },
      { status: 400 }
    );
  }

  // 5. Panggil downloader
  try {
    const data = await fetchPinterestMedia(url.trim());
    await insertLog(200);
    return NextResponse.json(
      {
        success: true,
        data
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Pinterest downloader error:', err.message);
    await insertLog(500);
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal memproses permintaan.' },
      { status: 500 }
    );
  }
}
