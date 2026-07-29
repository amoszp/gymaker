/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
    },
    extend: {
      colors: {
        ink: {
          950: "#050505",
          900: "#0A192F",
          800: "#11213D",
          700: "#1A2E4F",
        },
        crimson: {
          DEFAULT: "#7B2C33",
          50: "#F7ECEE",
          100: "#EDD8DC",
          200: "#DBB1B7",
          300: "#C98A93",
          400: "#B7646F",
          500: "#A53D4A",
          600: "#7B2C33",
          700: "#5E2127",
          800: "#41161B",
          900: "#240C0F",
        },
        forest: {
          DEFAULT: "#1DB954",
          50: "#E8FAF0",
          100: "#D1F5E1",
          300: "#9EE9BC",
          500: "#1DB954",
          600: "#179543",
        },
        gold: {
          DEFAULT: "#D4AF37",
          100: "#F8EFCE",
          300: "#EDD981",
          500: "#D4AF37",
          600: "#AA8B26",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Oswald"', '"Bebas Neue"', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.5rem",
        xl4: "2rem",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0,0,0,0.37)",
        crimson: "0 0 10px rgba(123, 44, 51, 0.2)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        fadeIn: "fadeIn 220ms ease-out both",
        popIn: "popIn 180ms ease-out both",
        shimmer: "shimmer 2.4s linear infinite",
      },
    },
  },
  plugins: [],
};
