import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f6ff',
          100: '#e2eaff',
          200: '#c7d5ff',
          300: '#a4b7ff',
          400: '#7e8bff',
          500: '#6062ff',
          600: '#453ae6',
          700: '#332ac3',
          800: '#282599',
          900: '#1f1f79',
          950: '#0f1045'
        }
      }
    }
  },
  plugins: []
};

export default config;
