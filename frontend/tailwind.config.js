/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          50:  '#E1F5EE',
          100: '#9FE1CB',
          400: '#1D9E75',
          600: '#0F6E56',
          800: '#085041',
        },
        coral: {
          50:  '#FAECE7',
          400: '#D85A30',
          600: '#993C1D',
        },
        purple: {
          50:  '#EEEDFE',
          400: '#7F77DD',
          600: '#534AB7',
        },
        amber: {
          50:  '#FAEEDA',
          400: '#BA7517',
          600: '#854F0B',
        },
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
}
