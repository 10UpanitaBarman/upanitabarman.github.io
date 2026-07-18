/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f4f6f8',
          100: '#e9edf1',
          200: '#cbd6e0',
          300: '#a9bacb',
          400: '#7c93a8',
          500: '#54697d',
          600: '#425a70',
          700: '#33475b',
          800: '#24344a',
          900: '#1a2a3c',
        },
        hsorange: {
          50: '#fff2ee',
          100: '#ffe1d6',
          400: '#ff9c7a',
          500: '#ff7a59',
          600: '#f15b32',
          700: '#e24810',
        },
        hsteal: {
          500: '#00a4bd',
          600: '#00879e',
        },
      },
      fontFamily: {
        sans: ['Lexend Deca', 'Avenir Next', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 0 0 1px rgba(35,55,75,0.06), -4px 0 24px rgba(33,45,64,0.12)',
        card: '0 1px 2px rgba(33,45,64,0.08)',
        pop: '0 4px 16px rgba(33,45,64,0.16)',
      },
    },
  },
  plugins: [],
}
