import axios from 'axios';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const API = 'https://api.guerrillamail.com/ajax.php';
const headers = {
  accept: 'application/json, text/javascript, */*; q=0.01',
  'user-agent':
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
};

async function createMail() {
  const { data } = await axios.get(API, {
    params: { lang: 'en', f: 'get_email_address' },
    headers,
    validateStatus: () => true
  });

  if (!data?.email_addr || !data?.sid_token) {
    throw new Error('Gagal membuat email');
  }

  return {
    email: data.email_addr,
    alias: data.alias || null,
    sid_token: data.sid_token,
    email_timestamp: data.email_timestamp || null
  };
}

// Handler POST (asli)
export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const apikey = searchParams.get('apikey');

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
      { user_id: userId, endpoint: '/api/maker/temp-mail/create', method: 'POST', status_code: statusCode }
    ]);
  };

  const { data: isSuccess, error: rpcError } = await supabaseAdmin.rpc('decrement_api_limit', { api_key_input: apikey });
  if (rpcError) {
    await insertLog(500);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan internal.' }, { status: 500 });
  }
  if (!isSuccess) {
    await insertLog(403);
    return NextResponse.json({ success: false, message: 'API Key tidak valid atau limit habis.' }, { status: 403 });
  }

  try {
    const data = await createMail();
    await insertLog(200);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error('Create error:', err.message);
    await insertLog(500);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// Handler GET (tambahan) -> supaya tidak error 405 saat dibuka di browser
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Gunakan method POST untuk membuat email baru.' },
    { status: 405 }
  );
}
