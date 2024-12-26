/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./dist/*.html", // If your HTML is at the root
    "/dist/**/*.{html,js,css}", // If your HTML or JS is inside the `src` folder
    "./src/**/*.{html,js}", // If your HTML or JS is inside the `src` folder
    "/src/index.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["cupcake"],
  },
};
