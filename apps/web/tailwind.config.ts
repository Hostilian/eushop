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

