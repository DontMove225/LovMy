/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        passion: '#EB0603',
        ember: '#F64135',
        velvet: '#800001',
        nightred: '#440004',
        obsidian: '#080714',
        steel: '#303B63',
        blush: '#E89EA1',
        ivory: '#FBF7F6',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-space-grotesk)', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'gradient-passion': 'linear-gradient(135deg, #F64135, #800001)',
        'gradient-duality': 'linear-gradient(135deg, #303B63, #EB0603)',
        'gradient-night': 'linear-gradient(135deg, #440004, #080714)',
      },
      maxWidth: {
        content: '1180px',
      },
      keyframes: {
        'heart-glow': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.06)', opacity: '1' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.16)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.1)' },
          '56%': { transform: 'scale(1)' },
        },
        halo: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'heart-glow': 'heart-glow 6s ease-in-out infinite',
        heartbeat: 'heartbeat 1.4s cubic-bezier(.66,0,.34,1) infinite',
        halo: 'halo 6s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        rise: 'rise 0.7s cubic-bezier(.22,1,.36,1) both',
      },
    },
  },
  plugins: [],
};
