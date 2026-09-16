import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50: "#fff5f7",
          100: "#ffe3e8",
          200: "#ffccd5",
          300: "#ffb3c1",
          400: "#ff8fa3",
          500: "#ff758f",
          600: "#ff4d6d",
          700: "#c9184a",
          800: "#a4133c",
          900: "#590d22",
        },
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["Nunito", "Quicksand", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
