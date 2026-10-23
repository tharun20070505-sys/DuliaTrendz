/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#F7F0E8',
          light: '#FBF7F2',
          dark: '#EBDDCF',
        },
        burgundy: {
          DEFAULT: '#641F36',
          hover: '#4E1528',
          light: '#7F2744',
          dark: '#3A0E1C',
        },
        champagne: {
          DEFAULT: '#D9B99B',
          light: '#EAD9C8',
          dark: '#B8926F',
        },
        charcoal: {
          DEFAULT: '#292524',
          light: '#44403C',
          dark: '#1C1917',
        },
        rose: {
          DEFAULT: '#C58A98',
          light: '#DEC1C9',
          dark: '#A66B7A',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(41, 37, 36, 0.06)',
        'elevated': '0 10px 30px -4px rgba(100, 31, 54, 0.12)',
      },
    },
  },
  plugins: [],
};
