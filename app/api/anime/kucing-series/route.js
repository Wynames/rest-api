import axios from 'axios';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ======================= NEKOPOI CLIENT (FULL) =======================
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
        this.validTypes = ['hentai', '2d_animation', '3d_hentai', 'jav', 'jav_cosplay'];
        this.validGenres = ['action', 'ahegao', 'anal', 'armpit', 'bdsm', 'big_oppai', 'blackmail', 'blonde', 'blowjob', 'bondage', 'comedy', 'creampie', 'dark_skin', 'dilf', 'elf', 'exhibitionist', 'fellatio', 'female_monster', 'femdom', 'footjob', 'forced', 'furry', 'futanari', 'gangbang', 'gore', 'handjob', 'harem', 'horror', 'housewife', 'humilation', 'humiliation', 'hypnotize', 'incest', 'intercrural', 'jav', 'lactation', 'loli', 'maid', 'male_monster', 'masturbation', 'megane', 'milf', 'mind_control', 'monster', 'netorare', 'nurse', 'old_man', 'onee_san', 'oral', 'paizuri', 'pantyhose', 'pregnant', 'prostitution', 'rape', 'romance', 'saimin', 'schoolgirl', 'semi_hentai', 'sex_toys', 'shibari', 'shota', 'stocking', 'succubus', 'supranatural', 'swimsuit', 'tentacles', 'threesome', 'tsundere', 'ugly_bastard', 'uncensored', 'vanilla', 'virgin', 'yaoi', 'yuri'];
    }
    async _request(endpoint) {
        try {
            const response = await this.apiClient.get(endpoint);
            return response.data;
        } catch (err) {
            throw new Error(`API Request failed: ${err.message}`);
        }
    }
    _checkParam(value, allowedList, paramName) {
        if (allowedList && !allowedList.includes(value)) {
            throw new Error(`Invalid ${paramName}. Allowed values: ${allowedList.join(', ')}.`);
        }
        if (!allowedList && isNaN(Number(value))) {
            throw new Error('Page parameter must be a valid number.');
        }
    }
    async getRecentUpdates() {
        return this._request('/recent');
    }
    async getListByAlphabet(letter, category, pageNum = '1') {
        this._checkParam(letter, this.validLetters, 'letter');
        this._checkParam(category, this.validTypes, 'type');
        this._checkParam(pageNum);
        return this._request(`/listall?letter=${letter}&type=${category}&page=${pageNum}`);
    }
    async getByGenre(genreName) {
        this._checkParam(genreName, this.validGenres, 'genre');
        const genreId = this.validGenres.indexOf(genreName);
        return this._request(`/searchByGenre?term=${genreId}`);
    }
    async find(keyword, pageNum = '1') {
        if (!keyword || keyword.trim() === '') throw new Error('Search keyword is missing.');
        this._checkParam(pageNum);
        return this._request(`/search?q=${encodeURIComponent(keyword)}&page=${pageNum}`);
    }
    async getPostDetails(postId) {
        if (!postId || isNaN(Number(postId))) throw new Error('Valid Post ID is required.');
        return this._request(`/post?id=${postId}`);
    }
    async getSeriesInfo(seriesId) {
        if (!seriesId || isNaN(Number(seriesId))) throw new Error('Valid Series ID is required.');
        return this._request(`/series?id=${seriesId}`);
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
    const seriesId = searchParams.get('id');

    if (!apikey) {
        return NextResponse.json({ success: false, message: 'API Key wajib disertakan!' }, { status: 401 });
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
            { user_id: userId, endpoint: '/api/anime/kucing-series', method: 'GET', status_code: statusCode }
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
        return NextResponse.json({ success: false, message: 'API Key tidak valid atau Limit habis.' }, { status: 403 });
    }

    if (!seriesId || isNaN(Number(seriesId))) {
        await insertLog(400);
        return NextResponse.json({ success: false, message: 'Parameter id diperlukan dan harus angka valid.' }, { status: 400 });
    }

    const client = new NekopoiClient();
    try {
        const data = await client.getSeriesInfo(seriesId);
        await insertLog(200);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (err) {
        console.error('Series error:', err.message);
        await insertLog(500);
        return NextResponse.json({ success: false, message: err.message || 'Gagal mengambil info seri.' }, { status: 500 });
    }
}
