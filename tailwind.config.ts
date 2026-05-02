import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-quicksand)", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-6px)" },
          "50%": { transform: "translateX(6px)" },
          "75%": { transform: "translateX(-6px)" },
        },
      },
      animation: {
        shake: "shake 0.4s ease-in-out",
      },
      colors: {
        // Operation colors (carry-over from print project DESIGN.md)
        add: {
          DEFAULT: "#059669",
          bg: "#d1fae5",
        },
        sub: {
          DEFAULT: "#e11d48",
          bg: "#ffe4e6",
        },
        mul: {
          DEFAULT: "#7c3aed",
          bg: "#ede9fe",
        },
        div: {
          DEFAULT: "#d97706",
          bg: "#fef3c7",
        },
        // Status colors for dashboard
        status: {
          rod: "#e11d48",
          gul: "#d97706",
          gron: "#059669",
        },
      },
    },
  },
  plugins: [],
};

export default config;
