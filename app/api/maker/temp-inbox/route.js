// File: app/api/maker/temp-inbox/route.js

import axios from 'axios';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ======================= SUPABASE ADMIN =======================
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ======================= CONFIGURATION =======================
const TEMPMAIL_BASE = "https://temp-mail.app/api";
const TEMPMAIL_HEADERS = {
  "accept": "*/*",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
};

// ======================= HELPER =======================
async function getTempMailMessages(visitorId) {
  const response = await axios.get(`${TEMPMAIL_BASE}/mail/list`, {
    headers: {
      ...TEMPMAIL_HEADERS,
      "visitor-id": visitorId
    },
    params: { part: "main" }
  });
  return response.data.message || [];
}

// ======================= API ROUTE HANDLER (GET) =======================
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apikey = searchParams.get('apikey');
  const visitorId = searchParams.get('visitorId');

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
        endpoint: '/api/maker/temp-inbox',
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

  // 4. Validasi parameter
  if (!visitorId) {
    await insertLog(400);
    return NextResponse.json(
      { success: false, message: 'Parameter visitorId wajib diisi.' },
      { status: 400 }
    );
  }

  // 5. Ambil inbox
  try {
    const messages = await getTempMailMessages(visitorId);
    await insertLog(200);
    return NextResponse.json(
      {
        success: true,
        data: {
          visitorId,
          messages
        }
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Inbox error:', err.message);
    await insertLog(500);
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal mengambil inbox.' },
      { status: 500 }
    );
  }
}
