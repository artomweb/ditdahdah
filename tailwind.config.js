/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./dist/*.html", // If your HTML is at the root
    "/src/**/*.{html,js}", // If your HTML or JS is inside the `src` folder
    "./script.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["cupcake"],
  },
};
