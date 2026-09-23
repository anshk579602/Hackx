import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090A0F",
        surface: "#10121A",
        surfaceHover: "#161924",
        borderDark: "#1E2235",
        borderLight: "#2E3550",
        graphite: {
          950: "#05070B",
          900: "#090A0F",
          850: "#0E1017",
          800: "#131620",
          750: "#181C28",
          700: "#1D2130",
          600: "#2B3147",
          500: "#444C6B",
          400: "#707A9E",
          300: "#A0A8C4",
          200: "#D0D5E6",
          100: "#F0F2F8",
        },
        brand: {
          indigo: "#6366F1",
          violet: "#8B5CF6",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
          cyan: "#06B6D4"
        },
        audit: {
          green: "#10B981",
          amber: "#F59E0B",
          red: "#EF4444",
          indigo: "#6366F1",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};

export default config;
