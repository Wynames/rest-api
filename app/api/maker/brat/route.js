// File: app/api/maker/brat/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// ======================= SUPABASE ADMIN =======================
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ======================= DAFTAR FONT SEKALI =======================
const FONT_PATH = path.join(process.cwd(), 'fonts', 'LiberationSans-Regular.ttf');
let fontReady = false;
if (fs.existsSync(FONT_PATH)) {
  try {
    GlobalFonts.registerFromPath(FONT_PATH, 'CustomFont');
    fontReady = true;
  } catch {
    console.error('Gagal mendaftarkan font');
  }
}

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
  if (!fontReady) throw new Error('Font tidak tersedia. Letakkan LiberationSans-Regular.ttf di folder fonts/');
  
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'top';

  let fontSize = 220;
  let lines;
  while (fontSize > 20) {
    ctx.font = `bold ${fontSize}px "CustomFont"`;
    lines = wrapText(ctx, text, SIZE - PADDING * 2);
    const totalHeight = lines.length * (fontSize * 1.15);
    if (totalHeight <= SIZE - PADDING * 2) break;
    fontSize -= 8;
  }

  let y = PADDING;
  for (const line of lines) {
    ctx.fillText(line, PADDING, y);
    y += fontSize * 1.15;
  }

  // @napi-rs/canvas bisa langsung encode PNG
  const pngBuffer = canvas.toBuffer('image/png');
  return await sharp(pngBuffer).webp({ quality: 92 }).toBuffer();
}

// ======================= API ROUTE HANDLER =======================
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apikey = searchParams.get('apikey');
  const text = (searchParams.get('text') || 'brat').trim();

  if (!apikey) {
    return NextResponse.json({ success: false, message: 'API Key wajib' }, { status: 401 });
  }

  const { data: keyData } = await supabaseAdmin
    .from('api_keys')
    .select('user_id')
    .eq('api_key', apikey)
    .maybeSingle();
  const userId = keyData?.user_id || null;

  const insertLog = async (statusCode) => {
    if (!userId) return;
    await supabaseAdmin.from('api_logs').insert([
      { user_id: userId, endpoint: '/api/maker/brat', method: 'GET', status_code: statusCode }
    ]);
  };

  const { data: isSuccess, error: rpcError } = await supabaseAdmin.rpc('decrement_api_limit', { api_key_input: apikey });
  if (rpcError) {
    await insertLog(500);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
  if (!isSuccess) {
    await insertLog(403);
    return NextResponse.json({ success: false, message: 'Invalid / limit habis' }, { status: 403 });
  }

  if (text.length > 200) {
    await insertLog(400);
    return NextResponse.json({ success: false, message: 'Teks maks 200 karakter' }, { status: 400 });
  }

  try {
    const webpBuffer = await generateBratImage(text);
    await insertLog(200);
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
    return NextResponse.json({ success: false, message: 'Gagal: ' + err.message }, { status: 500 });
  }
}
