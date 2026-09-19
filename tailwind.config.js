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
        background: '#0F172A',
        card: '#1E293B',
        'card-darker': '#131D2F',
        'card-lighter': '#24334A',
        primary: {
          DEFAULT: '#E50914',
          hover: '#b80710',
          glow: 'rgba(229, 9, 20, 0.35)',
        },
        secondary: '#6366F1',
        accent: '#38BDF8',
        success: '#22C55E',
        warning: '#FACC15',
        danger: '#EF4444',
        textPrimary: '#FFFFFF',
        textSecondary: '#94A3B8',
        textMuted: '#64748B',
        borderMuted: 'rgba(255, 255, 255, 0.08)',
        borderHover: 'rgba(255, 255, 255, 0.18)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 25px -5px rgba(229, 9, 20, 0.25)',
        'card-hover': '0 14px 40px -12px rgba(0, 0, 0, 0.65), 0 0 20px -3px rgba(56, 189, 248, 0.15)',
        'subtle-glow': '0 0 20px rgba(229, 9, 20, 0.18)',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      }
    },
  },
  plugins: [],
}
