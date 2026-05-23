import { NextResponse } from 'next/server';
import sharp from 'sharp';

// Kosongkan untuk fallback ke Arial, atau isi dengan base64 font
const FONT_BASE64 = '';

function generateBratSVG(text) {
  // Biarkan teks utuh, hanya potong jika ada newline (enter)
  const lines = text.split('\n');
  const fontSize = 200;
  const lineHeight = fontSize * 1.3;
  const paddingLeft = 80;
  const paddingTop = 120;
  const svgWidth = 1000;
  const svgHeight = Math.max(lines.length * lineHeight + paddingTop, 1000);

  const tspans = lines
    .map((line, i) => {
      const y = paddingTop + i * lineHeight;
      return `<tspan x="${paddingLeft}" y="${y}">${line}</tspan>`;
    })
    .join('\n');

  const fontStyle = FONT_BASE64
    ? `<style>
        @font-face {
          font-family: 'CustomFont';
          src: url('data:font/ttf;base64,${FONT_BASE64}') format('truetype');
        }
        text {
          font-family: 'CustomFont', Arial, sans-serif;
          font-weight: bold;
          font-size: ${fontSize}px;
          fill: black;
        }
      </style>`
    : `<style>
        text {
          font-family: Arial, sans-serif;
          font-weight: bold;
          font-size: ${fontSize}px;
          fill: black;
        }
      </style>`;

  const svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>${fontStyle}</defs>
  <rect width="${svgWidth}" height="${svgHeight}" fill="white"/>
  <text>${tspans}</text>
</svg>`;

  return svg;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const text = (searchParams.get('text') || 'BRAT').trim();
  const format = searchParams.get('format');

  if (text.length > 200) {
    return NextResponse.json({ success: false, message: 'Maks 200 karakter' }, { status: 400 });
  }

  try {
    const svg = generateBratSVG(text);
    const webpBuffer = await sharp(Buffer.from(svg)).webp({ quality: 92 }).toBuffer();

    if (format === 'base64') {
      const base64 = webpBuffer.toString('base64');
      return NextResponse.json({
        success: true,
        data: { image: `data:image/webp;base64,${base64}` }
      });
    }

    return new NextResponse(webpBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Gagal: ' + err.message }, { status: 500 });
  }
}
