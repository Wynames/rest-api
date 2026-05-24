// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Biarkan rute admin internal dan webhook lewat tanpa pengecekan API key
  if (pathname.startsWith('/api/admin/') || pathname.startsWith('/api/webhook')) {
    return NextResponse.next();
  }

  // Untuk rute API publik, cek keberadaan API key
  if (pathname.startsWith('/api/')) {
    const apiKey = request.nextUrl.searchParams.get('apikey');
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'API Key wajib disertakan!',
        },
        { status: 401 }
      );
    }
    // Lanjutkan, validasi detail dilakukan di route handler
    return NextResponse.next();
  }

  // Rute selain /api/ tidak terpengaruh
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
