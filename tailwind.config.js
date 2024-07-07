/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      screens: {
        mobileS: "320px",
        mobileM: "375px",
        mobileL: "420px",
        mobileXL: "500px",
        tablet: "768px",
        laptop: "1024px",
        desktop: "1280px",
        laptopL: "1440px",
        fourk: "2560px",
      }
    },
  },
  plugins: [],
}

