/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1A3A5C',
        'navy-deep': '#102640',
        cream: '#FAF8F4',
        'cream-2': '#F1EDE4',
        teal: '#028090',
        'teal-dark': '#016A77',
        ink: '#2C3E50',
        clay: '#E07A5F',
        'clay-dark': '#C9613F',
      },
      fontFamily: {
        display: ['Unbounded', 'system-ui', 'sans-serif'],
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '20px',
      },
      boxShadow: {
        card: '0 4px 20px -8px rgba(26, 58, 92, 0.18)',
        'card-hover': '0 18px 40px -12px rgba(26, 58, 92, 0.30)',
      },
      maxWidth: {
        prose: '46rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        marquee: 'marquee 38s linear infinite',
      },
    },
  },
  plugins: [],
}
