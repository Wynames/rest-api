// app/api/webhook/route.js
import { NextResponse } from 'next/server';

/**
 * POST /api/webhook
 * Endpoint simulasi untuk menerima bukti transfer upgrade.
 * Menerima body JSON: { username, roleTujuan, catatan }
 */
export async function POST(request) {
  try {
    // Baca body dari request
    const body = await request.json();

    const { username, roleTujuan, catatan } = body;

    // Validasi sederhana: pastikan data penting ada
    if (!username || !roleTujuan) {
      return NextResponse.json(
        {
          success: false,
          message: 'Data tidak lengkap. Pastikan username dan roleTujuan dikirim.',
        },
        { status: 400 }
      );
    }

    // Di sini nanti akan dikirim ke Discord webhook menggunakan fetch
    // atau disimpan ke Supabase untuk diproses admin.
    // Untuk saat ini, kita hanya mengembalikan success.

    console.log('Webhook received:', { username, roleTujuan, catatan });

    return NextResponse.json(
      {
        success: true,
        message: 'Notifikasi otomatis berhasil dikirim ke Webhook Discord Admin!',
        data: {
          username,
          roleTujuan,
          catatan,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan saat memproses request.',
      },
      { status: 500 }
    );
  }
}
