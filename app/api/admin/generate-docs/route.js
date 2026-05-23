// app/api/admin/generate-docs/route.js
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const body = await request.json();
    const { endpoint, method, description } = body;

    if (!endpoint || !method || !description) {
      return NextResponse.json(
        { success: false, message: 'Data tidak lengkap.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: 'Gemini API Key tidak dikonfigurasi.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Buat parameter JSON dan contoh response JSON untuk API endpoint ${endpoint} dengan deskripsi ${description}. Kembalikan HANYA format JSON valid dengan struktur: { "params": [...], "responseExample": "{...}" } tanpa markdown block.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Coba parsing JSON dari respon AI
    let data;
    try {
      // Bersihkan kemungkinan code block markdown
      let cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      data = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Gagal parse response AI:', text);
      return NextResponse.json(
        { success: false, message: 'AI mengembalikan format tidak valid.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Generate Docs error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat menghubungi AI.' },
      { status: 500 }
    );
  }
}
