import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        brand: {
          green: '#1e3f20',
          gold: '#d4a373',
          cream: '#faf7f0',
          sand: '#f4f1ea',
          dark: '#1c1d1a',
        }
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
