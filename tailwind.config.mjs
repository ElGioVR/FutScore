/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        pitch: {
          50: "#eefdf4",
          100: "#d7f9e5",
          500: "#1fbf75",
          700: "#087e50",
          950: "#07251b"
        },
        ink: "#101418",
        mist: "#f5f7f8"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(16, 20, 24, 0.08)"
      }
    },
  },
  plugins: [],
};
