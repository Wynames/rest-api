// app/(auth)/register/page.jsx
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      {/* Card Register */}
      <div className="w-full max-w-md rounded-xl border border-[#333333] bg-[#111111] p-8 shadow-2xl">
        {/* Judul */}
        <h1 className="text-2xl font-bold text-white mb-1">Daftar Akun Baru</h1>
        <p className="text-gray-400 text-sm mb-8">
          Isi data di bawah untuk membuat akun XT4 API.
        </p>

        {/* Form */}
        <form className="space-y-5">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1.5">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="johndoe"
              className="w-full rounded-lg border border-[#333333] bg-black px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors focus:border-white focus:ring-1 focus:ring-white"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="john@example.com"
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

          {/* Konfirmasi Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
              Konfirmasi Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-[#333333] bg-black px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors focus:border-white focus:ring-1 focus:ring-white"
            />
          </div>

          {/* Tombol Daftar */}
          <button
            type="submit"
            className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-black transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
          >
            Daftar Akun
          </button>
        </form>

        {/* Tautan ke Login */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-medium text-white hover:underline">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
