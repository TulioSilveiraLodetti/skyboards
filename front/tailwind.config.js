/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0b",
        coal: "#121214",
        steel: "#1b1b1f",
        concrete: "#2a2a30",
        volt: "#d7ff3e",
        voltdark: "#b4e01f",
        bone: "#f4f4f0",
      },
      fontFamily: {
        display: ['"Archivo"', '"Arial Narrow"', "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(215,255,62,0.5)",
        card: "0 20px 50px -20px rgba(0,0,0,0.7)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      animation: {
        marquee: "marquee 22s linear infinite",
        floaty: "floaty 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
