import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // BACKGROUNDS (Formerly Cream -> Now Clean White/Silver)
        cream: {
          50: '#ffffff',
          100: '#f8f9fa',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
        // Official Christ University Branding
        christ: {
          blue: '#2957A4',      // Official Primary Blue
          dark: '#052C6B',      // Catalina Blue (Secondary)
          gold: '#bfa36f',      // Official Gold/Tan
          light: '#e8f0fe',     // Soft Light Blue for highlights
          silver: '#f8f9fa',
        },
        // Mapped for backward compatibility but using new official hex codes
        forest: {
          50: '#f0f4ff',
          100: '#e8f0fe',
          200: '#bae6ff',
          300: '#7cc4fa',
          400: '#36a2eb',
          500: '#2957A4', // Main Blue (Christ Official)
          600: '#2957A4',
          700: '#052C6B', // Catalina Blue
          800: '#00162e',
          900: '#000d1a',
          950: '#00050a',
        },
        maroon: {
          50: '#fffdf5',
          100: '#fff7d6',
          200: '#ffebad',
          300: '#ffde85',
          400: '#ffd05c',
          500: '#bfa36f', // Main Gold (Christ Official)
          600: '#a38755',
          700: '#856b3e',
          800: '#6b542e',
          900: '#523f20',
        },
      },
      fontFamily: {
        serif: ['var(--font-merriweather)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // Ensure you installed this or remove if error
  ],
}

export default config