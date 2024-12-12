/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [],
  base: process.env.NODE_ENV === 'production' ? '/inspira/' : '/',
}

