/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        desert: {
          orange: "#E8743B",
          sand: "#F2D3A0",
          navy: "#1B2A41",
          black: "#0E0E10",
          red: "#D7263D",
          gold: "#C9A227",
          dust: "#D9C3A5",
          leather: "#8B4513"
        }
      },
      fontFamily: {
        display: ["'Bebas Neue'", "Oswald", "sans-serif"],
        body: ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
};
