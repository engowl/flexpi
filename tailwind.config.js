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
      fontFamily: {
        plex: ['"IBM Plex Sans"', "sans-serif"],
        neuton: ["Neuton", "serif"],
      },
      colors: {
        background: "#F2F2F2",
        primary: {
          DEFAULT: "#87E64C",
          50: "#F3FDED",
          100: "#E7FADB",
          200: "#CFF5B7",
          300: "#B7F094",
          400: "#9FEB70",
          500: "#87E64C",
          600: "#65D71E",
          700: "#4CA116",
          800: "#326B0F",
          900: "#193607",
          950: "#0D1B04",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
