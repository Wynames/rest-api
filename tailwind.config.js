// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Hindari purging class warna yang digunakan secara dinamis di syntax highlighting
  safelist: [
    'text-blue-400',
    'text-purple-400',
    'text-yellow-400',
    'text-green-400',
    'text-gray-400',
  ],
  theme: {
    extend: {
      colors: {
        'pure-black': '#000000',
        'rich-black': '#111111',
        'card-bg': '#1a1a1a',
        'border-dark': '#333333',
        'pure-white': '#FFFFFF',
        'text-secondary': '#AAAAAA',
      },
    },
  },
  plugins: [],
};
