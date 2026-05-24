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

async function inboxMail(sidToken, seq = 0) {
  const { data } = await axios.get(API, {
    params: { lang: 'en', f: 'check_email', sid_token: sidToken, seq },
    headers,
    validateStatus: () => true
  });

  const list = data?.list || [];

  return {
    sid_token: sidToken,
    total: list.length,
    inbox: list.map(mail => ({
      mail_id: mail.mail_id,
      from: mail.mail_from,
      subject: mail.mail_subject,
      excerpt: mail.mail_excerpt,
      timestamp: mail.mail_timestamp,
      date: mail.mail_date,
      read: mail.mail_read,
      size: mail.mail_size,
      attachments: mail.att || 0
    }))
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apikey = searchParams.get('apikey');
  const sid_token = searchParams.get('sid_token');
  const seq = searchParams.get('seq') || 0;

  if (!apikey) {
    return NextResponse.json({ success: false, message: 'API Key wajib' }, { status: 401 });
  }
  if (!sid_token) {
    return NextResponse.json({ success: false, message: 'sid_token wajib' }, { status: 400 });
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
      { user_id: userId, endpoint: '/api/maker/temp-mail/inbox', method: 'GET', status_code: statusCode }
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
    const data = await inboxMail(sid_token, seq);
    await insertLog(200);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error('Inbox error:', err.message);
    await insertLog(500);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
