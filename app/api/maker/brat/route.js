import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createCanvas, registerFont } from 'canvas';
import sharp from 'sharp';
import path from 'path';

// ======================= SUPABASE ADMIN =======================
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ======================= FONT SETUP =======================
const FONT_PATH = path.join(process.cwd(), 'fonts', 'LiberationSans-Regular.ttf');
registerFont(FONT_PATH, { family: 'CustomFont' });

// ======================= BRAT GENERATOR =======================
const SIZE = 1000;
const PADDING = 50;

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function generateBratImage(text) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  // Background putih
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Teks hitam
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'top';

  // Cari ukuran font terbesar yang muat
  let fontSize = 220;
  let lines;
  while (fontSize > 20) {
    ctx.font = `bold ${fontSize}px "CustomFont"`;
    lines = wrapText(ctx, text, SIZE - PADDING * 2);
    const totalHeight = lines.length * (fontSize * 1.15);
    if (totalHeight <= SIZE - PADDING * 2) break;
    fontSize -= 8;
  }

  // Gambar teks
  let y = PADDING;
  for (const line of lines) {
    ctx.fillText(line, PADDING, y);
    y += fontSize * 1.15;
  }

  // Dapatkan buffer PNG
  const pngBuffer = canvas.toBuffer('image/png');

  // Konversi ke WebP
  return await sharp(pngBuffer).webp({ quality: 92 }).toBuffer();
}

// ======================= API ROUTE HANDLER (GET) =======================
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apikey = searchParams.get('apikey');
  const text = searchParams.get('text') || 'brat';

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

  // 4. Validasi teks
  if (text.length > 200) {
    await insertLog(400);
    return NextResponse.json(
      { success: false, message: 'Teks maksimal 200 karakter.' },
      { status: 400 }
    );
  }

  // 5. Generate gambar
  try {
    const webpBuffer = await generateBratImage(text.trim());
    await insertLog(200);

    return new NextResponse(webpBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (err) {
    console.error('Brat generator error:', err.message);
    await insertLog(500);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat gambar: ' + err.message },
      { status: 500 }
    );
  }
}
