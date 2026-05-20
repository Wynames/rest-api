// app/(public)/page.jsx

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4">
      {/* Konten utama – diatur center sempurna */}
      <div className="text-center space-y-8 max-w-3xl">
        {/* Judul besar dengan tracking ketat */}
        <h1 className="text-6xl font-bold tracking-tight sm:text-7xl">
          XT4 API
        </h1>

        {/* Deskripsi singkat */}
        <p className="text-lg sm:text-xl text-text-secondary leading-relaxed">
          Platform REST API modern, cepat, dan handal dengan tema Yin‑Yang.
          Dapatkan akses ke berbagai endpoint premium untuk bot, aplikasi, dan
          otomatisasi tanpa hambatan.
        </p>

        {/* Dua tombol aksi */}
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          {/* Tombol Dokumentasi (outline) */}
          <a
            href="/docs"
            className="rounded-lg border border-pure-white px-8 py-3 text-pure-white hover:bg-pure-white hover:text-pure-black transition-all duration-200 font-medium"
          >
            Dokumentasi
          </a>

          {/* Tombol Mulai Sekarang (fill putih) */}
          <a
            href="/login"
            className="rounded-lg bg-pure-white px-8 py-3 text-pure-black hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            Mulai Sekarang
          </a>
        </div>
      </div>

      {/* Opsional: elemen dekoratif Yin‑Yang (subtle) */}
      <div className="mt-16 opacity-10">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="20" fill="white" />
          <path
            d="M20 0a20 20 0 0 1 0 40A20 20 0 0 1 20 0zm0 2a18 18 0 0 0 0 36V2z"
            fill="black"
          />
        </svg>
      </div>
    </main>
  );
}
