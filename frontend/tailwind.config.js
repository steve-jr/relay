/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette: #F9F5EB cream, #D9C69A sand, #70B7AE seafoam, #167D7A teal, #123E43 deep teal
        ink: '#123E43',
        lagoon: '#167D7A',
        sun: { DEFAULT: '#D9C69A', deep: '#C9B37E' }, // sand: primary action colour
        seafoam: '#70B7AE',
        hibiscus: '#B3204F', // reserved for errors
        paper: '#F9F5EB',
        mist: '#D7E6DC', // seafoam tinted toward cream for soft backgrounds
        muted: '#3F6165',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', 'system-ui', 'sans-serif'],
        sans: ['"Figtree Variable"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { tag: '14px' },
    },
  },
  plugins: [],
}
