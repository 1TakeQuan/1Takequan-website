/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/app/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          tan: "#D2B48C",
          brown: "#654321",
          red: "#B22222",
          black: "#000000",
          sky: "#87CEEB",
          grey: "#708090",
        },
      },
    },
  },
  plugins: [],
};
