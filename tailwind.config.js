/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#4DBBD5',
        success: '#00A087',
        'text-primary': '#3C5488',
        'text-secondary': '#8491B4',
        error: '#E64B35',
        warning: '#F39B7F',
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'sans-serif'],
        writing: ['LXGW WenKai', 'serif'],
      },
    },
  },
  plugins: [],
};
