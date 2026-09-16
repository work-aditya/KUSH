/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0B0F17',
          card: '#111827',
          surface: '#161F30',
          border: '#1F2937',
          borderLight: '#374151',
          accent: '#F59E0B',
          accentHover: '#D97706',
          emerald: '#10B981',
          emeraldHover: '#059669',
          danger: '#EF4444',
          text: '#F8FAFC',
          muted: '#94A3B8',
          darkMuted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
