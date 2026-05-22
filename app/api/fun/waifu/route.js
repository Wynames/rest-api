// app/api/fun/waifu/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const gender = searchParams.get('gender')?.toLowerCase();
  const apikey = searchParams.get('apikey');

  if (!apikey) {
    return NextResponse.json(
      { success: false, message: 'API Key wajib disertakan!' },
      { status: 401 }
    );
  }

  // Panggil RPC decrement_api_limit
  const { data: isSuccess, error: rpcError } = await supabaseAdmin.rpc(
    'decrement_api_limit',
    { api_key_input: apikey }
  );

  if (rpcError) {
    console.error('RPC error:', rpcError.message);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan internal.' },
      { status: 500 }
    );
  }

  if (!isSuccess) {
    return NextResponse.json(
      { success: false, message: 'API Key tidak valid atau Limit harian Anda habis. Silakan upgrade!' },
      { status: 403 }
    );
  }

  // Validasi gender
  if (!gender || (gender !== 'cowo' && gender !== 'cewe')) {
    return NextResponse.json(
      { success: false, message: 'Gender harus "cowo" atau "cewe".' },
      { status: 400 }
    );
  }

  // Ambil karakter dari database sesuai gender
  const { data: characters, error: dbError } = await supabaseAdmin
    .from('characters')
    .select('*')
    .eq('gender', gender);

  if (dbError) {
    console.error('Database error:', dbError.message);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data karakter.' },
      { status: 500 }
    );
  }

  if (!characters || characters.length === 0) {
    return NextResponse.json(
      { success: false, message: 'Tidak ada karakter tersedia untuk gender tersebut.' },
      { status: 404 }
    );
  }

  // Pilih acak
  const randomIndex = Math.floor(Math.random() * characters.length);
  const character = characters[randomIndex];

  return NextResponse.json(
    {
      success: true,
      data: {
        name: character.name,
        anime: character.anime,
        image: character.image_url,
      },
    },
    { status: 200 }
  );
}
