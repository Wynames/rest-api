import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

// ======================= SUPABASE ADMIN =======================
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ======================= GENERATOR EMAIL CLIENT (INBOX) =======================
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

  async inbox(em) {
    const p = this._p(em);
    if (!p) return { success: false, result: 'Email tidak valid' };
    const [u, d] = p;
    const v = await this._v(u, d);
    const ck = `surl=${d}/${u}`;
    let html;
    try {
      html = await this._f(this.api.base, {
        headers: { ...this.h, Cookie: ck },
        cache: 'no-store',
        _t: 1
      });
    } catch (e) {
      return {
        success: true,
        result: { email: em, emailStatus: v.status, uptime: v.uptime, inbox: [], error: e.message }
      };
    }

    if (html.includes('Email generator is ready')) {
      return { success: true, result: { email: em, emailStatus: v.status, uptime: v.uptime, inbox: [] } };
    }

    const $ = cheerio.load(html);
    const c = parseInt($('#mess_number').text()) || 0;
    const ib = [];

    const extractLinks = ($ctx, selector) => {
      const links = [];
      $ctx(selector + ' a').each((i, el) => {
        let href = $ctx(el).attr('href');
        if (href) {
          if (!href.startsWith('http')) href = new URL(href, this.api.base).href;
          links.push(href);
        }
      });
      return links;
    };

    if (c === 1) {
      const el = $('#email-table .e7m.row');
      const sp = el.find('.e7m.col-md-9 span');
      const messageEl = el.find('.e7m.mess_bodiyy');
      const links = extractLinks($, '.e7m.mess_bodiyy');
      ib.push({
        from: sp.eq(3).text().replace(/\(.*?\)/, '').trim(),
        to: sp.eq(1).text(),
        created: el.find('.e7m.tooltip').text().replace('Created: ', ''),
        subject: el.find('h1').text(),
        message: messageEl.text().trim(),
        links
      });
    } else if (c > 1) {
      for (const l of $('#email-table a').map((_, a) => $(a).attr('href')).get()) {
        const mHtml = await this._f(this.api.base + l, {
          headers: { ...this.h, Cookie: `surl=${l.replace('/', '')}` },
          cache: 'no-store',
          _t: 1
        });
        const m = cheerio.load(mHtml);
        const sp = m('.e7m.col-md-9 span');
        const messageEl = m('.e7m.mess_bodiyy');
        const links = extractLinks(m, '.e7m.mess_bodiyy');
        ib.push({
          from: sp.eq(3).text().replace(/\(.*?\)/, '').trim(),
          to: sp.eq(1).text(),
          created: m('.e7m.tooltip').text().replace('Created: ', ''),
          subject: m('h1').text(),
          message: messageEl.text().trim(),
          links
        });
      }
    }

    return {
      success: true,
      result: { email: em, emailStatus: v.status, uptime: v.uptime, inbox: ib }
    };
  }
}

// ======================= API ROUTE HANDLER (GET) =======================
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apikey = searchParams.get('apikey');
  const email = searchParams.get('email');

  if (!apikey) {
    return NextResponse.json({ success: false, message: 'API Key wajib disertakan (?apikey=...)' }, { status: 401 });
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
    console.error('RPC error:', rpcError.message);
    await insertLog(500);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan internal.' }, { status: 500 });
  }

  if (!isSuccess) {
    await insertLog(403);
    return NextResponse.json({ success: false, message: 'API Key tidak valid atau limit habis.' }, { status: 403 });
  }

  if (!email) {
    await insertLog(400);
    return NextResponse.json({ success: false, message: 'Parameter email wajib diisi.' }, { status: 400 });
  }

  try {
    const gen = new GeneratorEmail();
    const res = await gen.inbox(email.trim());
    if (!res.success) {
      await insertLog(500);
      return NextResponse.json({ success: false, message: res.result }, { status: 500 });
    }
    await insertLog(200);
    return NextResponse.json({ success: true, data: res.result }, { status: 200 });
  } catch (err) {
    console.error('Inbox error:', err.message);
    await insertLog(500);
    return NextResponse.json({ success: false, message: err.message || 'Gagal cek inbox.' }, { status: 500 });
  }
}
