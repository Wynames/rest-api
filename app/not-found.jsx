// app/not-found.jsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center">
      {/* Angka 404 raksasa */}
      <h1 className="text-9xl font-bold text-white opacity-20 select-none">404</h1>
      
      <div className="mt-[-60px] space-y-6">
        <h2 className="text-3xl font-bold text-white">Oops! Halaman tidak ditemukan.</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Halaman yang kamu cari tidak ada di dimensi ini. Mungkin telah dipindahkan atau tidak pernah ada.
        </p>
        
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          Kembali ke Home
        </Link>
      </div>
      
      {/* Elemen dekoratif */}
      <div className="mt-16 opacity-10">
        <svg width="50" height="50" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="20" fill="white" />
          <path d="M20 0a20 20 0 0 1 0 40A20 20 0 0 1 20 0zm0 2a18 18 0 0 0 0 36V2z" fill="black" />
        </svg>
      </div>
    </div>
  );
}
