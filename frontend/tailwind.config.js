/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#FFFFFF",
        muted: {
          DEFAULT: "#18181b",
          foreground: "#A1A1AA",
        },
        accent: {
          DEFAULT: "#2081E2",
          foreground: "#FFFFFF",
        },
        border: "#27272A",
        success: "#10B981",
      },
      fontFamily: {
        sans: ["Geist", "Inter", "sans-serif"],
        mono: ["Geist Mono", "monospace"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)",
        "halo-glow":
          "radial-gradient(circle at center, rgba(32,129,226,0.15), transparent 70%)",
      },
    },
  },
  plugins: [],
};
