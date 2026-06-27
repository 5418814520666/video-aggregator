/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        hub: {
          bg: '#0B0C10',
          card: '#1F2833',
          text: '#C5C6C7',
          muted: '#8892B0',
        },
        bilibili: '#FB7299',
        douyin: '#00F2FE',
        kuaishou: '#FF6600',
        cctv: '#D32F2F',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
