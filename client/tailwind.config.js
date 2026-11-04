/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#172554',
        },
        dark: {
          bg: '#000000',           // True Black primary canvas
          surface: '#0A0A0A',      // Primary cards, navbar, footer, drawers
          elevated: '#141414',     // Inputs, nested summary panels, table headers
          hover: '#1F1F1F',        // Interactive hover states
          border: '#262626',       // Crisp neutral surface border
          borderStrong: '#3A3A3A', // Input & focused control border
        },
        light: {
          bg: '#FAFAFA',
          surface: '#FFFFFF',
          elevated: '#F4F4F5',
          border: '#E4E4E7',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 160ms ease-out forwards',
      },
    },
  },
  plugins: [],
};
