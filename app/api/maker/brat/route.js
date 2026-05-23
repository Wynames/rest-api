import { NextResponse } from 'next/server';
import sharp from 'sharp';

// ======================= FONT BASE64 =======================
// Kosongkan string di bawah untuk pakai Arial (fallback aman)
// Jika mau font kustom, isi dengan base64 dari LiberationSans-Regular.ttf
const FONT_BASE64 = '';

// ======================= GENERATE SVG =======================
function generateBratSVG(text) {
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    // Potong baris jika lebih dari 15 karakter
    if (testLine.length > 15 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  const fontSize = 180;
  const lineHeight = fontSize * 1.3;
  const paddingLeft = 80;
  const paddingTop = 120;
  const svgWidth = 1000;
  const svgHeight = Math.max(lines.length * lineHeight + paddingTop * 1.5, 1000);

  // Buat elemen <tspan> dengan posisi Y mutlak, bukan akumulasi dy
  const tspans = lines
    .map((line, i) => {
      const y = paddingTop + i * lineHeight;
      return `<tspan x="${paddingLeft}" y="${y}">${line}</tspan>`;
    })
    .join('\n');

  // Style font: jika FONT_BASE64 kosong, gunakan Arial (pasti muncul)
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

// ======================= API HANDLER =======================
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const text = (searchParams.get('text') || 'brat').trim();
  const format = searchParams.get('format'); // "base64" untuk JSON

  // Validasi teks
  if (text.length > 200) {
    return NextResponse.json({ success: false, message: 'Maks 200 karakter' }, { status: 400 });
  }

  try {
    const svg = generateBratSVG(text);
    const webpBuffer = await sharp(Buffer.from(svg)).webp({ quality: 92 }).toBuffer();

    // Jika diminta base64
    if (format === 'base64') {
      const base64 = webpBuffer.toString('base64');
      return NextResponse.json({
        success: true,
        data: { image: `data:image/webp;base64,${base64}` }
      });
    }

    // Default: kirim gambar langsung
    return new NextResponse(webpBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (err) {
    console.error('Brat error:', err.message);
    return NextResponse.json({ success: false, message: 'Gagal: ' + err.message }, { status: 500 });
  }
}
