import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// ======================= SUPABASE ADMIN =======================
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ======================= FONT BASE64 =======================
// Biarkan kosong untuk pakai Arial, atau isi dengan base64 dari LiberationSans-Regular.ttf
const FONT_BASE64 = '';

// ======================= ESCAPE SVG =======================
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ======================= BRAT SVG GENERATOR =======================
function generateBratSVG(text) {
  const width = 1000;
  const height = 1000;
  // Posisi kiri atas, 50px dari kiri dan 150px dari atas
  const x = 50;
  const y = 150;
  const fontSize = 180;

  // Font style
  const fontFamily = FONT_BASE64
    ? `CustomFont, Arial, sans-serif`
    : `Arial, sans-serif`;

  // Jika ada font custom, definisikan @font-face
  const fontDef = FONT_BASE64
    ? `@font-face {
        font-family: 'CustomFont';
        src: url('data:font/ttf;base64,${FONT_BASE64}') format('truetype');
      }`
    : '';

  // Escape teks
  const safeText = escapeXml(text);

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      ${fontDef}
      text {
        font-family: ${fontFamily};
        font-weight: bold;
        font-size: ${fontSize}px;
        fill: black;
      }
    </style>
  </defs>
  <rect width="${width}" height="${height}" fill="white"/>
  <text x="${x}" y="${y}">${safeText}</text>
</svg>`;

  return svg;
}

// ======================= API ROUTE HANDLER =======================
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apikey = searchParams.get('apikey');
  const text = (searchParams.get('text') || 'BRAT').trim();
  const format = searchParams.get('format');

  // 1. Validasi API Key
  if (!apikey) {
    return NextResponse.json(
      { success: false, message: 'API Key wajib disertakan (?apikey=...)' },
      { status: 401 }
    );
  }

  // 2. Ambil user_id untuk log
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
        endpoint: '/api/maker/brat',
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

  // Validasi teks
  if (text.length > 200) {
    await insertLog(400);
    return NextResponse.json(
      { success: false, message: 'Teks maksimal 200 karakter.' },
      { status: 400 }
    );
  }

  // Generate gambar
  try {
    const svg = generateBratSVG(text);
    const webpBuffer = await sharp(Buffer.from(svg)).webp({ quality: 92 }).toBuffer();

    await insertLog(200);

    // Format base64
    if (format === 'base64') {
      const base64 = webpBuffer.toString('base64');
      return NextResponse.json({
        success: true,
        data: { image: `data:image/webp;base64,${base64}` }
      });
    }

    // Gambar langsung
    return new NextResponse(webpBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (err) {
    console.error('Brat error:', err.message);
    await insertLog(500);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat gambar: ' + err.message },
      { status: 500 }
    );
  }
}
