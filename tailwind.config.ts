import type { Config } from "tailwindcss";

const config: Config = {
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
        cream: "#f4f1ec",
        "cream-dark": "#e8e3db",
        "warm-white": "#faf9f7",
        slate: "#4a5568",
        "slate-light": "#718096",
        charcoal: "#2d3748",
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        body: ['"DM Sans"', "sans-serif"],
        editorial: ['"Source Serif 4"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "monospace"],
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
