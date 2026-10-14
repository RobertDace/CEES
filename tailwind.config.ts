import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0030FF",
          "blue-light": "#2D5BFF",
          "blue-glow": "#0055FF",
          cyan: "#00F0FF",
          purple: "#7928CA",
          amber: "#FFB800",
          red: "#FF3366",
        },
        dark: {
          void: "#060709",
          base: "#0A0C10",
          surface: "#10131A",
          elevated: "#161B26",
          border: "#1E2536",
          "border-bright": "#2E3A54",
        },
        steel: {
          100: "#F1F3F9",
          200: "#D3D7E3",
          300: "#A2AABF",
          400: "#75809C",
          500: "#505A73",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "sans-serif"],
        display: ["var(--font-oswald)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "grid-pattern": "linear-gradient(to right, rgba(0, 48, 255, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 48, 255, 0.07) 1px, transparent 1px)",
        "dots-pattern": "radial-gradient(rgba(0, 48, 255, 0.15) 1px, transparent 1px)",
      },
      boxShadow: {
        "blue-glow": "0 0 25px rgba(0, 48, 255, 0.45)",
        "blue-glow-lg": "0 0 45px rgba(0, 48, 255, 0.6)",
        "cyan-glow": "0 0 25px rgba(0, 240, 255, 0.45)",
        brutal: "4px 4px 0px 0px #0030FF",
        "brutal-white": "4px 4px 0px 0px #FFFFFF",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        marquee: "marquee 25s linear infinite",
        scanline: "scanline 8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
