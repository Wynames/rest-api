// app/api/fun/waifu/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apikey = searchParams.get('apikey');

  let gender = searchParams.get('gender') || searchParams.get('genre');
  if (gender) {
    gender = gender.replace(/['"]/g, '').toLowerCase().trim();
  }

  if (!apikey) {
    return NextResponse.json(
      { success: false, message: 'API Key wajib disertakan!' },
      { status: 401 }
    );
  }

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

  // Ambil userId untuk pencatatan log
  const { data: keyData } = await supabaseAdmin
    .from('api_keys')
    .select('user_id')
    .eq('api_key', apikey)
    .maybeSingle();

  if (!gender || (gender !== 'cowo' && gender !== 'cewe')) {
    // Log kegagalan validasi (400)
    if (keyData?.user_id) {
      await supabaseAdmin.from('api_logs').insert([
        { user_id: keyData.user_id, endpoint: '/api/fun/waifu', method: 'GET', status_code: 400 }
      ]);
    }
    return NextResponse.json(
      { success: false, message: 'Gender harus "cowo" atau "cewe".' },
      { status: 400 }
    );
  }

  const { data: characters, error: dbError } = await supabaseAdmin
    .from('characters')
    .select('*')
    .eq('gender', gender);

  if (dbError) {
    console.error('Database error:', dbError.message);
    // Log kegagalan server
    if (keyData?.user_id) {
      await supabaseAdmin.from('api_logs').insert([
        { user_id: keyData.user_id, endpoint: '/api/fun/waifu', method: 'GET', status_code: 500 }
      ]);
    }
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data karakter.' },
      { status: 500 }
    );
  }

  if (!characters || characters.length === 0) {
    if (keyData?.user_id) {
      await supabaseAdmin.from('api_logs').insert([
        { user_id: keyData.user_id, endpoint: '/api/fun/waifu', method: 'GET', status_code: 404 }
      ]);
    }
    return NextResponse.json(
      { success: false, message: 'Tidak ada karakter tersedia untuk gender tersebut.' },
      { status: 404 }
    );
  }

  const randomIndex = Math.floor(Math.random() * characters.length);
  const character = characters[randomIndex];

  // Log sukses
  if (keyData?.user_id) {
    await supabaseAdmin.from('api_logs').insert([
      { user_id: keyData.user_id, endpoint: '/api/fun/waifu', method: 'GET', status_code: 200 }
    ]);
  }

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
