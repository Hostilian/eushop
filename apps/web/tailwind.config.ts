import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Class-based dark mode: add 'dark' class to <html> to activate.
  // Persist user preference in localStorage and respect prefers-color-scheme.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CSS variable tokens (set in globals.css)
        primary:   'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        danger:    'var(--color-danger)',
        success:   'var(--color-success)',
        warning:   'var(--color-warning)',
        'v20-bg':      'var(--color-gray-50)',
        'v20-surface': 'var(--color-surface)',
        'v20-text':    'var(--color-gray-900)',
        'v20-border':  'var(--color-border)',
        'v20-muted':   'var(--color-gray-100)',
        // Override default grays to match our V20 neutral palette
        gray: {
          50:  'var(--color-gray-50)',   // Warm Ivory background
          100: 'var(--color-border)',    // Warm Stone Gray border
          200: 'var(--color-gray-100)',   // Soft Stone
          300: '#d1cdc0',
          400: '#a39e8f',
          500: '#7a7566',
          600: '#5c584c',
          700: '#3e3a30',
          800: 'var(--color-gray-900)',   // Charcoal Black text
          900: '#161b19',
        },
        green: {
          200: 'var(--color-green-200)',
          900: 'var(--color-green-900)',
        },
        yellow: {
          500: '#f59e0b',
        },
        // Brand palette
        brand: {
          green:  '#1e3f20',
          gold:   '#d4a373',
          cream:  '#faf7f0',
          sand:   '#f4f1ea',
          dark:   '#1c1d1a',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in':  'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;