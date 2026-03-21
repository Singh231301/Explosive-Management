import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f6f2ff",
          100: "#eee5ff",
          200: "#dcc8ff",
          300: "#c3a1ff",
          400: "#a06bff",
          500: "#8443f5",
          600: "#7230db",
          700: "#5f26b6",
          800: "#4f2491",
          900: "#441f76"
        },
        surface: "#f7f5fb",
        ink: "#19152a",
        success: "#1c9f67",
        warning: "#f59e0b",
        danger: "#dc2626"
      },
      boxShadow: {
        soft: "0 20px 45px -20px rgba(72, 32, 133, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
