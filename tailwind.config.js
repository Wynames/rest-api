// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tema Yin-Yang: hitam pekat, putih bersih, abu‑abu gelap untuk border/card
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
