/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        scripture: ['Newsreader', 'Georgia', 'serif'],
      },
      colors: {
        opal: {
          gold: '#BD8F2A',
          'gold-light': '#DFBC58',
          emerald: '#10B981',
        },
      },
    },
  },
  plugins: [],
}