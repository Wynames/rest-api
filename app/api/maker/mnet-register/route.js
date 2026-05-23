// File: app/api/maker/mnet-register/route.js (FIXED)

import axios from 'axios';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ======================= SUPABASE ADMIN =======================
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ======================= CONFIGURATION =======================
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
    webBase: 'https://id.mnetplus.world',
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

// ======================= HELPER FUNCTIONS =======================
function generateRandomPassword(length = 12) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';

  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  const all = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

function generateUUID() {
  return crypto.randomUUID();
}

function getRandomBirthYear() {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100;
  const maxYear = currentYear - 14;
  return String(Math.floor(Math.random() * (maxYear - minYear + 1) + minYear));
}

function getRandomGender() {
  const genders = ['m', 'f', 'non-binary', 'unknown'];
  return genders[Math.floor(Math.random() * 2)];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ======================= SAFE AXIOS HELPER =======================
async function safeRequest(config) {
  try {
    const response = await axios({
      ...config,
      responseType: 'text' // ambil sebagai teks dulu
    });
    // Coba parse sebagai JSON kalau memungkinkan
    try {
      response.data = JSON.parse(response.data);
    } catch {
      // biarkan sebagai string
    }
    return response;
  } catch (err) {
    // Jika error dari axios, periksa apakah ada response dari server
    if (err.response) {
      const status = err.response.status;
      const body = err.response.data;
      throw new Error(`Server error ${status}: ${JSON.stringify(body).slice(0, 200)}`);
    }
    throw err;
  }
}

// ======================= TEMP MAIL FUNCTIONS =======================
async function getTempEmail() {
  const visitorId = generateUUID();
  const response = await safeRequest({
    method: 'GET',
    url: `${CONFIG.tempmail.baseUrl}/mail/address`,
    headers: {
      ...CONFIG.tempmail.headers,
      'visitor-id': visitorId
    },
    params: {
      refresh: false,
      expire: 1440,
      part: 'main'
    }
  });

  const email = response.data?.address;
  if (!email) throw new Error('Gagal mendapatkan email sementara: respons tidak valid');
  return { email, visitorId, expire: response.data.expire };
}

async function getTempMailMessages(visitorId) {
  const response = await safeRequest({
    method: 'GET',
    url: `${CONFIG.tempmail.baseUrl}/mail/list`,
    headers: {
      ...CONFIG.tempmail.headers,
      'visitor-id': visitorId
    },
    params: { part: 'main' }
  });
  return response.data?.message || [];
}

// ======================= MNET REGISTRATION FLOW =======================
async function checkEmailStatus(email) {
  try {
    const response = await safeRequest({
      method: 'GET',
      url: `${CONFIG.mnet.apiBase}/user/signup/email/status?email=${encodeURIComponent(email)}`,
      headers: CONFIG.mnet.headers
    });
    return response.data?.success && response.data?.data?.status === 0;
  } catch (error) {
    // Jika tidak bisa cek, anggap tersedia
    return true;
  }
}

async function sendEmailAuthToken(email) {
  const response = await safeRequest({
    method: 'POST',
    url: `${CONFIG.mnet.apiBase}/user/email/authToken`,
    headers: CONFIG.mnet.headers,
    data: {
      email: email,
      purpose: 'signup',
      deviceName: 'Win32'
    }
  });

  if (response.data?.success && response.data?.data?.token) {
    return response.data.data.token;
  }
  throw new Error(response.data?.message || 'Gagal mendapatkan auth token');
}

async function saveTmpSignup(email, password, birthDate, gender, authToken) {
  const optionalTerms = [{ termsId: 'marketing', termsVer: '20221106' }];
  const response = await safeRequest({
    method: 'POST',
    url: `${CONFIG.mnet.apiBase}/user/signup/save-tmp`,
    headers: CONFIG.mnet.headers,
    data: {
      email: email,
      password: password,
      birthDate: birthDate,
      gender: gender,
      optionalTerms: optionalTerms,
      authToken: authToken
    }
  });

  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Gagal menyimpan data sementara');
  }
  return true;
}

async function waitForVerification(email, visitorId, maxAttempts = 12, interval = 5000) {
  // Coba cek lewat API Mnet dulu
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await safeRequest({
        method: 'GET',
        url: `${CONFIG.mnet.apiBase}/user/signup/email/status?email=${encodeURIComponent(email)}`,
        headers: CONFIG.mnet.headers
      });
      if (response.data?.success && response.data?.data?.status === 1) {
        return { verified: true, code: null };
      }
    } catch (error) {
      // abaikan error
    }
    await sleep(interval);
  }

  // Fallback: cek inbox temp mail
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
      if (codeMatch) {
        return { verified: true, code: codeMatch[0] };
      }
    }
  }

  return { verified: false, code: null };
}

async function performRegistration() {
  // Step 1: Get temp email
  const { email, visitorId } = await getTempEmail();

  // Step 2: Check availability (opsional)
  await checkEmailStatus(email);

  // Step 3: Generate random account data
  const password = generateRandomPassword();
  const birthDate = getRandomBirthYear();
  const gender = getRandomGender();

  // Step 4: Get auth token
  const authToken = await sendEmailAuthToken(email);

  // Step 5: Save temporary signup
  await saveTmpSignup(email, password, birthDate, gender, authToken);

  // Step 6: Wait for email verification
  const verification = await waitForVerification(email, visitorId);

  return {
    success: true,
    email,
    password,
    birthDate,
    gender,
    visitorId,
    verified: verification.verified,
    verificationCode: verification.code || null
  };
}

// ======================= API ROUTE HANDLER (POST) =======================
export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const apikey = searchParams.get('apikey');

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
        endpoint: '/api/maker/mnet-register',
        method: 'POST',
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

  // 4. Jalankan registrasi
  try {
    const result = await performRegistration();
    await insertLog(200);
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (err) {
    console.error('Registration error:', err.message);
    await insertLog(500);
    // Berikan pesan error yang lebih jelas
    return NextResponse.json(
      { success: false, message: 'Gagal registrasi: ' + (err.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
