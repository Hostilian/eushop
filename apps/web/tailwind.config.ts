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
        primary: '#2563eb',
        secondary: '#7c3aed',
        danger: '#dc2626',
        success: '#16a34a',
        warning: '#f59e0b',
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
