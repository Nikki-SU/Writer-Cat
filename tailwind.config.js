/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#4DBBD5',
        success: '#00A087',
        body: '#3C5488',
        secondary: '#8491B4',
        error: '#E64B35',
        warning: '#F39B7F',
        // 情绪渐变色
        emotion: {
          darkBlue: '#1A237E',
          lightBlue: '#64B5F6',
          white: '#FFFFFF',
          lightRed: '#EF9A9A',
          darkRed: '#B71C1C',
        },
      },
      fontFamily: {
        writing: ['"LXGW WenKai"', 'sans-serif'],
        ui: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
