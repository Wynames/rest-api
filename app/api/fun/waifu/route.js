// app/api/fun/waifu/route.js
import { NextResponse } from 'next/server';

// Dummy database Waifu & Husbu (untuk ilustrasi, nanti bisa diganti Supabase)
const waifuList = [
  {
    name: 'Mikasa Ackerman',
    anime: 'Attack on Titan',
    image: 'https://example.com/mikasa.jpg',
  },
  {
    name: 'Rem',
    anime: 'Re:Zero',
    image: 'https://example.com/rem.jpg',
  },
  {
    name: 'Asuna Yuuki',
    anime: 'Sword Art Online',
    image: 'https://example.com/asuna.jpg',
  },
];

const husbuList = [
  {
    name: 'Levi Ackerman',
    anime: 'Attack on Titan',
    image: 'https://example.com/levi.jpg',
  },
  {
    name: 'Kirito',
    anime: 'Sword Art Online',
    image: 'https://example.com/kirito.jpg',
  },
  {
    name: 'Gojo Satoru',
    anime: 'Jujutsu Kaisen',
    image: 'https://example.com/gojo.jpg',
  },
];

/**
 * GET /api/fun/waifu?gender=cowo|cewe
 * Mengembalikan satu karakter acak sesuai gender yang diminta.
 */
export async function GET(request) {
  // Ambil query parameter 'gender'
  const { searchParams } = new URL(request.url);
  const gender = searchParams.get('gender')?.toLowerCase();

  // Validasi parameter
  if (!gender) {
    return NextResponse.json(
      {
        success: false,
        message: 'Parameter "gender" wajib diisi. Gunakan ?gender=cowo atau ?gender=cewe.',
      },
      { status: 400 }
    );
  }

  if (gender !== 'cowo' && gender !== 'cewe') {
    return NextResponse.json(
      {
        success: false,
        message: 'Gender harus "cowo" atau "cewe".',
      },
      { status: 400 }
    );
  }

  // Pilih daftar sesuai gender
  const list = gender === 'cowo' ? waifuList : husbuList;

  // Ambil satu item secara acak
  const randomIndex = Math.floor(Math.random() * list.length);
  const character = list[randomIndex];

  // Return response sukses
  return NextResponse.json(
    {
      success: true,
      data: {
        name: character.name,
        anime: character.anime,
        image: character.image,
      },
    },
    { status: 200 }
  );
}
