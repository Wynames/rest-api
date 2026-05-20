# XT4 API - Platform REST API Modern

Platform REST API modular, aman, dan cepat yang dibangun dengan **Next.js** dan **Supabase**. Dirancang untuk mendukung pengembangan bot, aplikasi, dan otomatisasi dengan sistem role bertingkat.

## Fitur Utama

- ⚡ **Modular**: Satu endpoint = satu file, sehingga error pada satu API tidak memengaruhi API lainnya.
- 🔐 **Keamanan Berlapis**: API Key wajib disertakan melalui query atau header, dilindungi middleware rate limiter.
- 👑 **Sistem Role**: Guest (limit kecil), Free, VIP, hingga King's – masing-masing dengan kuota dan akses berbeda.
- 📦 **Dashboard User**: Pantau pemakaian limit, salin API key, dan upgrade role dengan mudah.
- 🎨 **Tema Yin‑Yang**: Desain minimalis, elegan, background hitam pekat dengan aksen abu‑abu gelap.

## Teknologi

- [Next.js 14](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/) (tema kustom)
- [Supabase](https://supabase.com/) (database & authentication)
- [Vercel](https://vercel.com/) (deployment)

## Panduan Instalasi Lokal

1. **Clone repositori**

   ```bash
   git clone https://github.com/username/xt4-api.git
   cd xt4-api
