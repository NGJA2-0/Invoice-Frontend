/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0b1b2b',
          800: '#13243a',
          700: '#1b2f4a',
          600: '#2b405c',
          500: '#3a4f6b',
        },
        cloud: {
          50: '#f7f9fc',
          100: '#eff3f9',
          200: '#e1e9f3',
          300: '#c8d6ea',
        },
        azure: {
          50: '#eaf3ff',
          100: '#d6e7ff',
          200: '#b1d1ff',
          300: '#7fb0ff',
          400: '#4c8cff',
          500: '#2f6cf3',
          600: '#1d55d8',
          700: '#1a46b2',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 35, 64, 0.08)',
        card: '0 12px 40px rgba(15, 35, 64, 0.12)',
        glow: '0 8px 24px rgba(47, 108, 243, 0.18)',
      },
      borderRadius: {
        xl: '18px',
        '2xl': '22px',
      },
      fontFamily: {
        sans: ['"Segoe UI Variable"', '"Segoe UI"', 'Candara', 'Optima', 'sans-serif'],
        display: ['"Palatino Linotype"', '"Book Antiqua"', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'page-gradient': 'linear-gradient(135deg, #f7f9fc 0%, #ffffff 55%, #eef3fb 100%)',
        'glass-sheen': 'linear-gradient(140deg, rgba(255,255,255,0.6), rgba(255,255,255,0.1))',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}
