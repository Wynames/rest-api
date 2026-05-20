// app/(auth)/login/page.jsx
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      {/* Card Login */}
      <div className="w-full max-w-md rounded-xl border border-[#333333] bg-[#111111] p-8 shadow-2xl">
        {/* Judul */}
        <h1 className="text-2xl font-bold text-white mb-1">Masuk ke Akun</h1>
        <p className="text-gray-400 text-sm mb-8">
          Silakan login untuk melanjutkan ke dashboard.
        </p>

        {/* Form */}
        <form className="space-y-5">
          {/* Username / Email */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1.5">
              Username atau Email
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="johndoe atau john@example.com"
              className="w-full rounded-lg border border-[#333333] bg-black px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors focus:border-white focus:ring-1 focus:ring-white"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-[#333333] bg-black px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors focus:border-white focus:ring-1 focus:ring-white"
            />
          </div>

          {/* Tombol Masuk */}
          <button
            type="submit"
            className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-black transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
          >
            Masuk
          </button>
        </form>

        {/* Tautan ke Register */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Belum punya akun?{' '}
          <Link href="/register" className="font-medium text-white hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
