import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1a2332",
        "navy-deep": "#0f1722",
        teal: "#0d7377",
        "teal-light": "#10a3a8",
        gold: "#d4a843",
        cream: "#ede8e0",
        "cream-dark": "#e0dbd2",
        "warm-white": "#ffffff",
        slate: "#4a5568",
        "slate-light": "#718096",
        charcoal: "#2d3748",
        // Dark mode tokens
        "dark-bg": "#0F1923",
        "dark-card": "#152130",
        "dark-border": "#1d2d3e",
        "dark-text": "#e8e4dd",
        "dark-muted": "#8a96a8",
        "dark-dim": "#5c6878",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
        editorial: ["var(--font-source-serif)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        "gradient-navy":
          "linear-gradient(135deg, #0f1722 0%, #1a2332 50%, #162540 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
