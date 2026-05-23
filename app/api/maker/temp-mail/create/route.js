import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

// ======================= SUPABASE ADMIN =======================
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ======================= GENERATOR EMAIL CLIENT =======================
class GeneratorEmail {
  constructor() {
    this.api = {
      base: 'https://generator.email/',
      validate: 'check_adres_validation3.php'
    };
    this.h = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Upgrade-Insecure-Requests': '1'
    };
    this._cookie = '';
  }

  async _f(u, o, r = 5) {
    for (let i = 0; i < r; i++) {
      try {
        const fetchOptions = { ...o, redirect: 'manual' };
        if (this._cookie) {
          fetchOptions.headers = fetchOptions.headers || {};
          fetchOptions.headers.Cookie = this._cookie;
        }
        const res = await fetch(u, fetchOptions);
        const setCookie = res.headers.get('set-cookie');
        if (setCookie) {
          const match = setCookie.match(/surl=([^;]+)/);
          if (match) this._cookie = `surl=${match[1]}`;
        }
        if (res.status === 301 || res.status === 302) {
          const location = res.headers.get('location');
          if (location) return this._f(location, o, r);
        }
        return o._t ? await res.text() : await res.json();
      } catch (err) {
        if (i === r - 1) throw new Error(err.message);
      }
    }
  }

  async _v(u, d) {
    try {
      return await this._f(this.api.base + this.api.validate, {
        method: 'POST',
        headers: { ...this.h, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ usr: u, dmn: d })
      });
    } catch (e) {
      return { err: e.message };
    }
  }

  _p(e) {
    return e?.includes('@') ? e.split('@') : null;
  }

  async generate(domain = '') {
    try {
      const initUrl = domain ? this.api.base + domain : this.api.base;
      await this._f(initUrl, { headers: this.h, cache: 'no-store', _t: 1 });

      const html = await this._f(this.api.base, { headers: this.h, cache: 'no-store', _t: 1 });
      const $ = cheerio.load(html);
      const em = $('#email_ch_text').text();
      if (!em) return { success: false, result: 'Gagal generate email' };

      const [u, d] = this._p(em);
      const v = await this._v(u, d);
      return {
        success: true,
        result: {
          email: em,
          emailStatus: v.status || null,
          uptime: v.uptime || null,
          ...(v.err && { error: v.err })
        }
      };
    } catch (e) {
      return { success: false, result: e.message };
    }
  }
}

// ======================= API ROUTE HANDLER (POST) =======================
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
      { user_id: userId, endpoint: '/api/maker/temp-mail/create', method: 'POST', status_code: statusCode }
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

  // 4. Ambil domain dari body (opsional)
  let body = {};
  try {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 0) {
      body = await request.json();
    }
  } catch {}

  const domain = body?.domain || '';

  // 5. Generate email
  try {
    const gen = new GeneratorEmail();
    const result = await gen.generate(domain);
    if (!result.success) {
      await insertLog(500);
      return NextResponse.json({ success: false, message: result.result }, { status: 500 });
    }
    await insertLog(200);
    return NextResponse.json({ success: true, data: result.result }, { status: 200 });
  } catch (err) {
    console.error('Generator error:', err.message);
    await insertLog(500);
    return NextResponse.json({ success: false, message: err.message || 'Gagal generate email.' }, { status: 500 });
  }
}
