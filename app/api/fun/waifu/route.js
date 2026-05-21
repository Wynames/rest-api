// app/api/fun/waifu/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Client khusus server dengan service role (untuk akses penuh ke database)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Dummy database Waifu & Husbu
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

  // 1. VALIDASI 1: API key wajib
  if (!apikey) {
    return NextResponse.json(
      { success: false, message: 'API Key wajib diisi. Tambahkan ?apikey=...' },
      { status: 401 }
    );
  }

  // 2. VALIDASI 2: Cari API key di tabel api_keys
  const { data: keyData, error: keyError } = await supabaseAdmin
    .from('api_keys')
    .select('user_id, api_key')
    .eq('api_key', apikey)
    .maybeSingle(); // bisa null jika tidak ditemukan

  if (keyError || !keyData) {
    return NextResponse.json(
      { success: false, message: 'API Key tidak valid.' },
      { status: 401 }
    );
  }

  const userId = keyData.user_id;

  // 3. VALIDASI 3: Cek limit user
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('limit_harian')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    return NextResponse.json(
      { success: false, message: 'Gagal memverifikasi pengguna.' },
      { status: 500 }
    );
  }

  if (userData.limit_harian <= 0) {
    return NextResponse.json(
      { success: false, message: 'Limit harian habis. Silakan upgrade ke paket yang lebih tinggi.' },
      { status: 403 }
    );
  }

  // 4. Kurangi limit user sebesar 1
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ limit_harian: userData.limit_harian - 1 })
    .eq('id', userId);

  if (updateError) {
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui limit.' },
      { status: 500 }
    );
  }

  // 5. Setelah limit dipotong, tangani gender parameter
  if (!gender || (gender !== 'cowo' && gender !== 'cewe')) {
    return NextResponse.json(
      { success: false, message: 'Gender harus "cowo" atau "cewe".' },
      { status: 400 }
    );
  }

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
