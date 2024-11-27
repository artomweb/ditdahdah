/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["*.{html,js}", "js/*.js"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["cupcake"],
  },
  safelist: [{ pattern: /alert-+/ }],
};
