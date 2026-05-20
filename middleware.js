// middleware.js
import { NextResponse } from 'next/server';

/**
 * Middleware Dummy untuk pengecekan API Key.
 * Jika user mengakses path yang mengandung '/api/' (kecuali '/api/webhook'),
 * maka cek apakah ada query parameter 'apikey'.
 * Jika tidak ada, kembalikan respons 401.
 */
export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // Hanya berlaku untuk endpoint di bawah /api/ kecuali /api/webhook
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/webhook')) {
    const apiKey = searchParams.get('apikey');

    if (!apiKey) {
      // Kirim respon error 401 jika API key tidak ada
      return NextResponse.json(
        {
          success: false,
          message: 'API Key tidak valid atau tidak disertakan!',
        },
        { status: 401 }
      );
    }

    // Di sini nantinya bisa ditambahkan validasi ke database Supabase
    // untuk mengecek apakah API key valid, limit, dll.
    // Untuk sekarang, jika ada apikey, lanjutkan request.
  }

  // Lanjutkan request untuk path lain atau jika API key ada
  return NextResponse.next();
}

// Tentukan di path mana middleware ini akan berjalan
export const config = {
  matcher: ['/api/:path*'], // Hanya untuk path /api/*
};
