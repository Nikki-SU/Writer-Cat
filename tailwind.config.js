/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4DBBD5',
        success: '#00A087',
        info: '#3C5488',
        secondary: '#8491B4',
        danger: '#E64B35',
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
