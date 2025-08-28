/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cormorant: ["'Cormorant Garamond'", "serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        primary: "#1d4ed8",   // change to your brand color
        secondary: "#9333ea", // change to your brand color
        accent: "#f59e0b",    // optional
      },
    },
  },
  plugins: [],
};
