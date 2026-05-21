// app/api/fun/waifu/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Client khusus server dengan service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Dummy database Waifu & Husbu (masih statis)
const waifuList = [
  { name: 'Mikasa Ackerman', anime: 'Attack on Titan', image: 'https://example.com/mikasa.jpg' },
  { name: 'Rem', anime: 'Re:Zero', image: 'https://example.com/rem.jpg' },
  { name: 'Asuna Yuuki', anime: 'Sword Art Online', image: 'https://example.com/asuna.jpg' },
];

const husbuList = [
  { name: 'Levi Ackerman', anime: 'Attack on Titan', image: 'https://example.com/levi.jpg' },
  { name: 'Kirito', anime: 'Sword Art Online', image: 'https://example.com/kirito.jpg' },
  { name: 'Gojo Satoru', anime: 'Jujutsu Kaisen', image: 'https://example.com/gojo.jpg' },
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const gender = searchParams.get('gender')?.toLowerCase();
  const apikey = searchParams.get('apikey');

  // Middleware sudah memastikan apikey ada, tetapi kita pertahankan untuk lapisan keamanan tambahan
  if (!apikey) {
    return NextResponse.json(
      { success: false, message: 'API Key wajib disertakan!' },
      { status: 401 }
    );
  }

  // Panggil RPC decrement_api_limit untuk pemotongan limit yang aman
  const { data: isSuccess, error: rpcError } = await supabaseAdmin.rpc(
    'decrement_api_limit',
    { api_key_input: apikey }
  );

  // Jika terjadi error di database
  if (rpcError) {
    console.error('RPC error:', rpcError.message);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan internal.' },
      { status: 500 }
    );
  }

  // RPC mengembalikan false: key tidak valid atau limit habis
  if (!isSuccess) {
    return NextResponse.json(
      { success: false, message: 'API Key tidak valid atau Limit harian Anda habis. Silakan upgrade!' },
      { status: 403 }
    );
  }

  // Jika berhasil (limit terpotong), lanjutkan validasi gender
  if (!gender || (gender !== 'cowo' && gender !== 'cewe')) {
    return NextResponse.json(
      { success: false, message: 'Gender harus "cowo" atau "cewe".' },
      { status: 400 }
    );
  }

  // Pilih karakter acak
  const list = gender === 'cowo' ? waifuList : husbuList;
  const randomIndex = Math.floor(Math.random() * list.length);
  const character = list[randomIndex];

  return NextResponse.json(
    {
      success: true,
      data: {
        name: character.name,
        anime: character.anime,
        image: character.image,
      },
    },
    { status: 200 }
  );
}
