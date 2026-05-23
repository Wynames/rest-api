// ============================================================
// File: app/api/tools/temp-mail/create/route.js
// Deskripsi: Generate & save email sementara
// ============================================================

import axios from 'axios';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ======================= SUPABASE ADMIN =======================
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ======================= MULTI-TOOLS CLIENT =======================
const BASE_URL = 'https://multi-tools.cloud';
const SESSION = 'd2f4mr5d7gmgmkom026ek9iqpk';

const mtHeaders = {
  'accept': '*/*',
  'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'x-requested-with': 'XMLHttpRequest',
  'referer': 'https://multi-tools.cloud/',
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
  'cookie': `PHPSESSID=${SESSION}`,
};

async function generateEmail() {
  const res = await axios.get(`${BASE_URL}/?action=generate&_=${Date.now()}`, { headers: mtHeaders });
  return res.data;
}

async function saveEmail(email, uptime = '232', status = 'good') {
  const res = await axios.post(
    `${BASE_URL}/?action=save_email&_=${Date.now()}`,
    { email, uptime, status },
    {
      headers: {
        ...mtHeaders,
        'content-type': 'application/json',
        'origin': 'https://multi-tools.cloud',
      }
    }
  );
  return res.data;
}

// ======================= API ROUTE HANDLER =======================
export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const apikey = searchParams.get('apikey');

  // 1. Validasi API Key
  if (!apikey) {
    return NextResponse.json({ success: false, message: 'API Key wajib disertakan (?apikey=...)' }, { status: 401 });
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
      { user_id: userId, endpoint: '/api/tools/temp-mail/create', method: 'POST', status_code: statusCode }
    ]);
  };

  // 3. Decrement limit
  const { data: isSuccess, error: rpcError } = await supabaseAdmin.rpc('decrement_api_limit', { api_key_input: apikey });

  if (rpcError) {
    console.error('RPC error:', rpcError.message);
    await insertLog(500);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan internal.' }, { status: 500 });
  }

  if (!isSuccess) {
    await insertLog(403);
    return NextResponse.json({ success: false, message: 'API Key tidak valid atau limit habis.' }, { status: 403 });
  }

  // 4. Generate email
  try {
    const genResult = await generateEmail();
    // Ekstrak alamat email (dari berbagai kemungkinan struktur)
    const email = genResult?.result?.email ?? genResult?.email ?? genResult;

    if (!email || typeof email !== 'string') {
      await insertLog(500);
      return NextResponse.json({ success: false, message: 'Gagal menghasilkan email.' }, { status: 500 });
    }

    // 5. Simpan email
    const saveResult = await saveEmail(email);
    await insertLog(200);
    return NextResponse.json({
      success: true,
      data: {
        email,
        save_status: saveResult?.status ?? saveResult
      }
    }, { status: 200 });
  } catch (err) {
    console.error('Create error:', err.message);
    await insertLog(500);
    return NextResponse.json({ success: false, message: err.message || 'Gagal membuat email.' }, { status: 500 });
  }
}
