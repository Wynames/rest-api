import axios from 'axios';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ======================= SUPABASE ADMIN =======================
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ======================= HELPERS =======================
function uuid() {
  return crypto.randomUUID();
}

function parseNDJSON(raw) {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    throw new Error('Respons dari server AI kosong atau tidak valid');
  }

  let fullText = "";
  const chunks = [];
  const lines = raw.split("\n").map(v => v.trim()).filter(Boolean);

  if (lines.length === 0) {
    throw new Error('Respons NDJSON kosong');
  }

  for (const line of lines) {
    try {
      const json = JSON.parse(line);
      chunks.push(json);
      if (json.type === "delta" && json.delta) {
        fullText += json.delta;
      }
    } catch {
      // abaikan baris yang bukan JSON valid
    }
  }

  if (!fullText && chunks.length === 0) {
    throw new Error('Gagal mengekstrak teks dari respons NDJSON');
  }

  return { text: fullText, chunks };
}

async function unlimitedAiChat(prompt, options = {}) {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt wajib diisi");
  }

  const chatId = options.chatId || uuid();
  const now = new Date().toISOString();

  const payload = {
    chatId,
    messages: [
      {
        id: uuid(),
        role: "user",
        content: prompt,
        parts: [{ type: "text", text: prompt }],
        createdAt: now
      },
      {
        id: uuid(),
        role: "assistant",
        content: "",
        parts: [{ type: "text", text: "" }],
        createdAt: now
      }
    ],
    selectedChatModel: options.model || "chat-model-reasoning",
    selectedCharacter: null,
    selectedStory: null,
    deviceId: options.deviceId || uuid(),
    locale: options.locale || "id"
  };

  // Gunakan axios dengan responseType 'text', pastikan dapat data mentah
  let response;
  try {
    response = await axios.post(
      "https://app.unlimitedai.chat/api/chat",
      payload,
      {
        headers: {
          "content-type": "application/json",
          accept: "application/x-ndjson, application/json, text/plain, */*",
          "x-next-intl-locale": payload.locale,
          origin: "https://app.unlimitedai.chat",
          referer: "https://app.unlimitedai.chat/",
          "user-agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        },
        responseType: "text"
      }
    );
  } catch (err) {
    // Tangani error dari axios (timeout, network, dll)
    console.error('Error saat request ke AI:', err.message);
    if (err.response) {
      // Server unlimitedai merespons dengan status error
      throw new Error(`AI server error: ${err.response.status} - ${JSON.stringify(err.response.data).slice(0, 200)}`);
    } else if (err.request) {
      throw new Error('Tidak ada respons dari server AI (network error)');
    } else {
      throw err;
    }
  }

  // Periksa apakah data ada
  if (!response.data) {
    throw new Error('Respons dari server AI kosong');
  }

  // Parse NDJSON
  const parsed = parseNDJSON(response.data);
  
  if (!parsed.text) {
    throw new Error('Tidak dapat mengekstrak jawaban dari respons AI');
  }

  return {
    chatId,
    answer: parsed.text
  };
}

// ======================= API ROUTE HANDLER (POST) =======================
export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const apikey = searchParams.get('apikey');

  // 1. Validasi API Key
  if (!apikey) {
    return NextResponse.json(
      { success: false, message: "API Key wajib disertakan di query (?apikey=...)" },
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
        endpoint: '/api/ai/unlimited-chat',
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
      { success: false, message: "Terjadi kesalahan internal." },
      { status: 500 }
    );
  }

  if (!isSuccess) {
    await insertLog(403);
    return NextResponse.json(
      { success: false, message: "API Key tidak valid atau limit harian habis." },
      { status: 403 }
    );
  }

  // 4. Ambil body JSON dengan aman
  let body;
  try {
    const contentLength = request.headers.get('content-length');
    if (!contentLength || parseInt(contentLength) === 0) {
      await insertLog(400);
      return NextResponse.json(
        { success: false, message: "Request body tidak boleh kosong." },
        { status: 400 }
      );
    }
    body = await request.json();
  } catch (err) {
    await insertLog(400);
    return NextResponse.json(
      { success: false, message: "Request body harus JSON valid. " + err.message },
      { status: 400 }
    );
  }

  if (!body || typeof body !== 'object') {
    await insertLog(400);
    return NextResponse.json(
      { success: false, message: "Request body harus berupa JSON object." },
      { status: 400 }
    );
  }

  const prompt = (body.prompt || '').trim();
  if (!prompt) {
    await insertLog(400);
    return NextResponse.json(
      { success: false, message: "Parameter 'prompt' wajib diisi dalam body." },
      { status: 400 }
    );
  }

  // 5. Panggil AI
  try {
    const options = {
      chatId: body.chatId || undefined,
      model: body.model || undefined,
      deviceId: body.deviceId || undefined,
      locale: body.locale || undefined
    };

    const result = await unlimitedAiChat(prompt, options);
    await insertLog(200);
    return NextResponse.json(
      { success: true, result },
      { status: 200 }
    );
  } catch (err) {
    console.error('AI chat error:', err.message);
    await insertLog(500);
    return NextResponse.json(
      { success: false, message: err.message || "Gagal memproses chat." },
      { status: 500 }
    );
  }
}
