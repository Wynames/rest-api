import axios from 'axios';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ======================= NEKOPOI CLIENT =======================
export class NekopoiClient {
    constructor() {
        this.apiClient = axios.create({
            baseURL: 'https://api.explorethefrontierforlimitlessimaginationanddiscov.com/330cceade91a6a9cd30fb8042222ed56/71b8acf33b508c7543592acd9d9eb70d',
            headers: {
                'token': 'XbGSFkQsJYbFC6pcUMCFL4oNHULvHU7WdDAXYgpmqYlh7p5ZCQ4QZ13GDgowiOGvAejz9X5H6DYvEQBMrc3A17SO3qwLwVkbn6YY',
                'accept': 'application/json',
                'appbuildcode': '25301',
                'appsignature': 'pOplm8IDEDGXN55IaYohQ8CzJFvWsfXyhGvwPRD9kWgzYSRuuvAOPfsE0AJbHVbAJyWGsGCNUIuQLJ7HbMbuFLMWwDgHNwxOrYMH',
                'accept-encoding': 'gzip',
                'user-agent': 'okhttp/4.10.0',
                'if-modified-since': 'Fri, 20 Jun 2025 07:10:42 GMT'
            }
        });
        this.validLetters = ['0-9', ...Array.from({length: 26}, (_, i) => String.fromCharCode(97 + i))];
    }

    _checkParam(value, allowedList, paramName) {
        if (allowedList && !allowedList.includes(value)) {
            throw new Error(`Invalid ${paramName}. Allowed values: ${allowedList.join(', ')}.`);
        }
        if (!allowedList && isNaN(Number(value))) {
            throw new Error('Page parameter must be a valid number.');
        }
    }

    async find(keyword, pageNum = '1') {
        if (!keyword || keyword.trim() === '') throw new Error('Search keyword is missing.');
        this._checkParam(pageNum);
        const response = await this.apiClient.get(`/search?q=${encodeURIComponent(keyword)}&page=${pageNum}`);
        return response.data;
    }
}

// ======================= SUPABASE ADMIN =======================
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ======================= API ROUTE HANDLER =======================
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const apikey = searchParams.get('apikey');
    const keyword = searchParams.get('q') || searchParams.get('keyword');

    // 1. Cek kehadiran API Key
    if (!apikey) {
        return NextResponse.json(
            { success: false, message: 'API Key wajib disertakan!' },
            { status: 401 }
        );
    }

    // 2. Ambil user_id SEKALI untuk semua log
    const { data: keyData } = await supabaseAdmin
        .from('api_keys')
        .select('user_id')
        .eq('api_key', apikey)
        .maybeSingle();
    const userId = keyData?.user_id || null;

    // Helper function DRY untuk insert log
    const insertLog = async (statusCode) => {
        if (!userId) return; // tidak ada user_id, skip log
        await supabaseAdmin.from('api_logs').insert([
            {
                user_id: userId,
                endpoint: '/api/nekopoi/search',
                method: 'GET',
                status_code: statusCode
            }
        ]);
    };

    // 3. Validasi & kurangi limit API key
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
            { success: false, message: 'API Key tidak valid atau Limit harian Anda habis. Silakan upgrade!' },
            { status: 403 }
        );
    }

    // 4. Validasi parameter pencarian
    if (!keyword || keyword.trim() === '') {
        await insertLog(400);
        return NextResponse.json(
            { success: false, message: 'Parameter pencarian (q atau keyword) diperlukan dan tidak boleh kosong.' },
            { status: 400 }
        );
    }

    // 5. Lakukan pencarian
    const client = new NekopoiClient();
    try {
        const data = await client.find(keyword.trim());
        await insertLog(200);
        return NextResponse.json(
            { success: true, data },
            { status: 200 }
        );
    } catch (err) {
        console.error('Search error:', err.message);
        await insertLog(500);
        return NextResponse.json(
            { success: false, message: err.message || 'Gagal melakukan pencarian.' },
            { status: 500 }
        );
    }
}
