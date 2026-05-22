// app/api/webhook/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, roleTujuan, catatan } = body;

    if (!username || !roleTujuan) {
      return NextResponse.json(
        { success: false, message: 'Data tidak lengkap. Pastikan username dan roleTujuan dikirim.' },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('DISCORD_WEBHOOK_URL tidak disetel di environment.');
      return NextResponse.json(
        { success: false, message: 'Konfigurasi webhook tidak ditemukan.' },
        { status: 500 }
      );
    }

    // Kirim ke Discord
    const discordPayload = {
      content: `📩 **Request Upgrade Baru**\n👤 Username: **${username}**\n🎯 Role Tujuan: **${roleTujuan}**\n📝 Catatan: ${catatan || '-'}`,
    };

    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    if (!discordResponse.ok) {
      console.error('Gagal mengirim webhook ke Discord:', discordResponse.status);
      return NextResponse.json(
        { success: false, message: 'Gagal mengirim notifikasi ke Discord.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Notifikasi berhasil dikirim ke Discord.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
