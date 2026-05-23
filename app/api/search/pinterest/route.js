import axios from 'axios';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ======================= SUPABASE ADMIN =======================
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ======================= PINTEREST SEARCH HELPERS =======================
function traceId() {
  return crypto.randomBytes(8).toString('hex');
}
function spanId() {
  return crypto.randomBytes(8).toString('hex');
}
function appVer() {
  return crypto.randomBytes(4).toString('hex').slice(0, 7);
}
function ts() {
  return Date.now();
}

async function pinterestSearch(q, requestedLimit = 25) {
  // Pastikan limit adalah integer valid, antara 1-100
  const limit = Math.min(Math.max(parseInt(requestedLimit, 10) || 25, 1), 100);

  const trace = traceId();
  const span = spanId();

  const data = encodeURIComponent(
    JSON.stringify({
      options: {
        query: q,
        scope: 'pins',
        appliedProductFilters: '---',
        domains: null,
        user: null,
        seoDrawerEnabled: false,
        applied_unified_filters: null,
        auto_correction_disabled: false,
        journey_depth: null,
        source_id: null,
        source_module_id: null,
        source_url: `/search/pins/?q=${encodeURIComponent(q)}&rs=typed`,
        static_feed: false,
        selected_one_bar_modules: null,
        query_pin_sigs: null,
        page_size: limit,           // kirim limit asli ke Pinterest
        price_max: null,
        price_min: null,
        query_image_pins: null,
        request_params: null,
        top_pin_ids: null,
        article: null,
        corpus: null,
        customized_rerank_type: null,
        filters: null,
        rs: 'typed',
        redux_normalize_feed: true
      },
      context: {}
    })
  );

  const url =
    `https://id.pinterest.com/resource/BaseSearchResource/get/` +
    `?source_url=${encodeURIComponent(`/search/pins/?q=${encodeURIComponent(q)}&rs=typed`)}` +
    `&data=${data}&_=${ts()}`;

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Android 15; Mobile; rv:150.0) Gecko/150.0 Firefox/150.0',
    Accept: 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'identity',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Pinterest-AppState': 'active',
    'X-Pinterest-Source-Url': `/search/pins/?rs=typed&q=${encodeURIComponent(q)}`,
    'X-Pinterest-PWS-Handler': 'www/search/[scope].js',
    'screen-dpr': '2.857142857142857',
    Referer: `https://id.pinterest.com/search/pins/?rs=typed&q=${encodeURIComponent(q)}`,
    'X-APP-VERSION': appVer(),
    'X-B3-TraceId': trace,
    'X-B3-SpanId': span,
    'X-B3-ParentSpanId': trace,
    'X-B3-Flags': '0'
  };

  const response = await axios.get(url, { headers });

  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status}`);
  }

  const json = response.data;
  const pins = json?.resource_response?.data?.results || [];

  if (pins.length === 0) {
    throw new Error('Tidak ada pin ditemukan');
  }

  // Potong sesuai limit yang sudah dijamin integer
  return pins.slice(0, limit).map((p, i) => ({
    n: i + 1,
    id: p.id,
    title: p.title || p.grid_title || p.description?.slice(0, 80) || '(no title)',
    desc: p.description?.slice(0, 150) || '',
    url: `https://www.pinterest.com/pin/${p.id}/`,
    image: p.images?.['736x']?.url || p.images?.orig?.url || null,
    saves: p.save_count || p.repin_count || 0,
    board: p.board?.name || null,
    link: p.link || null
  }));
}

// ======================= API ROUTE HANDLER (GET) =======================
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apikey = searchParams.get('apikey');
  const query = searchParams.get('q');
  const limitParam = searchParams.get('limit');
  
  // Parsing limit yang aman
  let limit = 25; // default
  if (limitParam) {
    const parsed = parseInt(limitParam, 10);
    if (!isNaN(parsed)) {
      limit = parsed;
    }
  }

  // 1. Validasi API Key
  if (!apikey) {
    return NextResponse.json(
      { success: false, message: 'API Key wajib disertakan (?apikey=...)' },
      { status: 401 }
    );
  }

  // 2. Ambil user_id sekali untuk log
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
        endpoint: '/api/search/pinterest',
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

  // 4. Validasi parameter pencarian
  if (!query) {
    await insertLog(400);
    return NextResponse.json(
      { success: false, message: 'Parameter q (query pencarian) wajib diisi.' },
      { status: 400 }
    );
  }

  if (limit < 1 || limit > 100) {
    await insertLog(400);
    return NextResponse.json(
      { success: false, message: 'Parameter limit harus angka 1-100.' },
      { status: 400 }
    );
  }

  // 5. Panggil Pinterest Search
  try {
    const results = await pinterestSearch(query.trim(), limit);
    await insertLog(200);
    return NextResponse.json(
      {
        success: true,
        data: {
          query: query.trim(),
          count: results.length,
          results
        }
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Pinterest search error:', err.message);
    await insertLog(500);
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal melakukan pencarian.' },
      { status: 500 }
    );
  }
}
