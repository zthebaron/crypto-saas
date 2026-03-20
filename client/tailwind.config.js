import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        crypto: {
          dark: '#0a0e17',
          card: '#111827',
          border: '#1f2937',
          accent: '#6366f1',
        },
      },
    },
  },
  plugins: [],
};
