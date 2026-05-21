// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // Hanya berlaku untuk endpoint di bawah /api/ kecuali /api/webhook
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/webhook')) {
    const apiKey = searchParams.get('apikey');

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'API Key wajib disertakan!',
        },
        { status: 401 }
      );
    }

    // API key ada, lanjutkan request – validasi database dilakukan di route
    return NextResponse.next();
  }

  // Lanjutkan untuk path lainnya
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
