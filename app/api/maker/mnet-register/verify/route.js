// File: app/api/maker/mnet-register/verify/route.js
import axios from 'axios';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CONFIG = {
  tempmail: {
    baseUrl: 'https://temp-mail.app/api',
    headers: {
      accept: '*/*',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
    }
  },
  mnet: {
    apiBase: 'https://www.mnetplus.world/api/account-service/v1',
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/json',
      origin: 'https://id.mnetplus.world',
      referer: 'https://id.mnetplus.world/',
      'sec-ch-ua': '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'user-agent':
        'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36'
    }
  }
};

async function safeRequest(config) {
  try {
    const response = await axios({
      ...config,
      responseType: 'text'
    });
    try {
      response.data = JSON.parse(response.data);
    } catch {}
    return response;
  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      const body = err.response.data;
      throw new Error(`Server error ${status}: ${JSON.stringify(body).slice(0, 200)}`);
    }
    throw err;
  }
}

async function getTempMailMessages(visitorId) {
  const response = await safeRequest({
    method: 'GET',
    url: `${CONFIG.tempmail.baseUrl}/mail/list`,
    headers: { ...CONFIG.tempmail.headers, 'visitor-id': visitorId },
    params: { part: 'main' }
  });
  return response.data?.message || [];
}

async function checkMnetStatus(email) {
  const response = await safeRequest({
    method: 'GET',
    url: `${CONFIG.mnet.apiBase}/user/signup/email/status?email=${encodeURIComponent(email)}`,
    headers: CONFIG.mnet.headers
  });
  return response.data?.data?.status === 1;
}

// Polling pendek (aman untuk Vercel Hobby)
async function verifyEmail(email, visitorId, maxAttempts = 3, interval = 3000) {
  // Coba cek API Mnet dulu
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const verified = await checkMnetStatus(email);
      if (verified) return { verified: true, code: null };
    } catch {}
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  // Fallback ke inbox
  const messages = await getTempMailMessages(visitorId);
  for (const msg of messages) {
    if (
      msg.fromAddress &&
      (msg.fromAddress.toLowerCase().includes('mnet') ||
        msg.subject?.toLowerCase().includes('verify') ||
        msg.subject?.toLowerCase().includes('인증'))
    ) {
      const cleanText = (msg.content || '').replace(/<[^>]*>/g, ' ');
      const codeMatch = cleanText.match(/\b\d{6}\b/);
      if (codeMatch) return { verified: true, code: codeMatch[0] };
    }
  }
  return { verified: false, code: null };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apikey = searchParams.get('apikey');
  const email = searchParams.get('email');
  const visitorId = searchParams.get('visitorId');

  if (!apikey) {
    return NextResponse.json({ success: false, message: 'API Key wajib disertakan (?apikey=...)' }, { status: 401 });
  }
  if (!email || !visitorId) {
    return NextResponse.json({ success: false, message: 'Parameter email dan visitorId wajib' }, { status: 400 });
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
      { user_id: userId, endpoint: '/api/maker/mnet-register/verify', method: 'GET', status_code: statusCode }
    ]);
  };

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

  try {
    const result = await verifyEmail(email, visitorId);
    await insertLog(200);
    return NextResponse.json({ success: true, data: { ...result, email } }, { status: 200 });
  } catch (err) {
    console.error('Verify error:', err.message);
    await insertLog(500);
    return NextResponse.json({ success: false, message: 'Gagal verifikasi: ' + err.message }, { status: 500 });
  }
}
