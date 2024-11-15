import { nextui } from "@nextui-org/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: { plex: ['"IBM Plex Sans"', "sans-serif"] },
      colors: {
        background: "#F2F2F2",
        primary: {
          DEFAULT: "#B6FA89",
          50: "#F9FFF5",
          100: "#F0FEE7",
          200: "#E1FDCE",
          300: "#D5FCBA",
          400: "#C6FBA2",
          500: "#B6FA89",
          600: "#89F740",
          700: "#60E10A",
          800: "#3E9306",
          900: "#1F4903",
          950: "#112702",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
