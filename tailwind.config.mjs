/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bf: {
          teal: "#64C3B0",
          text: "#0D0F1A",
          sub: "#6B7280",
          card: "#F6FAF9",
        },
      },
      boxShadow: {
        soft: "0 6px 24px rgba(13,15,26,0.06)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
