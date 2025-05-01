/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      gridTemplateColumns: {
        // 16-column grid for our app layout
        '16': 'repeat(16, minmax(0, 1fr))',
      },
      colors: {
        background: "#ffffff",
        "background-muted": "#f6f7f8",
        primary: "#111111",
        secondary: "#555555",
        accent: "#0062ff",
        border: "#e1e2e6",
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        DEFAULT: "0.375rem", // 6px
        lg: "0.5rem",       // 8px
        md: "0.375rem",     // 6px
        sm: "0.25rem",      // 4px
      },
      boxShadow: {
        DEFAULT: "0 1px 2px rgba(0,0,0,0.1)",
        md: "0 4px 8px rgba(0,0,0,0.1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
}