/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Neomorphic base colors
        neo: {
          DEFAULT: '#1a1a23',
          light: '#1e1e29',
          dark: '#16161e',
          50: '#252530',
          100: '#22222d',
          200: '#1f1f28',
          300: '#1c1c25',
        },
        accent: {
          primary: '#3b82f6',
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
        },
        risk: {
          low: '#10b981',
          medium: '#f59e0b',
          high: '#ef4444',
          critical: '#dc2626'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Neomorphic shadows
        neo: '8px 8px 16px #16161e, -8px -8px 16px #1e1e29',
        'neo-sm': '4px 4px 8px #16161e, -4px -4px 8px #1e1e29',
        'neo-lg': '12px 12px 24px #16161e, -12px -12px 24px #1e1e29',
        'neo-inset': 'inset 6px 6px 12px #16161e, inset -6px -6px 12px #1e1e29',
        'neo-inset-sm': 'inset 4px 4px 8px #16161e, inset -4px -4px 8px #1e1e29',
        'neo-hover': '12px 12px 24px #121219, -12px -12px 24px #22222d',
        'neo-focus': 'inset 6px 6px 12px #16161e, inset -6px -6px 12px #1e1e29, 0 0 0 2px rgba(59, 130, 246, 0.3)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'subtle-pulse': 'subtlePulse 2s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        subtlePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        slideInRight: {
          'from': { opacity: '0', transform: 'translateX(20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
