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
      },
      animation: {
        'heart-glow': 'heart-glow 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
