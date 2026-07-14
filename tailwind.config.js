/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c2d6ff',
          300: '#93b8ff',
          400: '#6390ff',
          500: '#3b6cf7',
          600: '#2549eb',
          700: '#1d35d8',
          800: '#1e2db0',
          900: '#1e2b8b',
          950: '#161c54',
        },
        accent: {
          50: '#fdf8ef',
          100: '#faefd9',
          200: '#f4dbb1',
          300: '#edc280',
          400: '#e4a24d',
          500: '#dc882c',
          600: '#ce6e21',
          700: '#ab531d',
          800: '#894220',
          900: '#6f371d',
          950: '#3c1a0e',
        },
        surface: {
          50: '#f8f9fc',
          100: '#f0f2f7',
          200: '#e4e7ef',
          300: '#d0d5e2',
          400: '#b7bed0',
          500: '#9da5be',
          600: '#848dab',
          700: '#717993',
          800: '#5e6479',
          900: '#4e5363',
          950: '#2e3139',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
