/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink:    { DEFAULT: "#0f1623", 50: "#f0f3f8", 100: "#dde4ef", 900: "#0f1623" },
        slate:  { DEFAULT: "#1e2b3f" },
        gold:   { DEFAULT: "#c9a84c", light: "#f0d97a", dark: "#9a7833" },
        emerald:{ DEFAULT: "#10b981" },
        crimson:{ DEFAULT: "#e53e3e" },
        violet: { DEFAULT: "#7c3aed" },
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.28)",
        glow: "0 0 20px rgba(201,168,76,0.3)",
      },
    },
  },
  plugins: [],
}
