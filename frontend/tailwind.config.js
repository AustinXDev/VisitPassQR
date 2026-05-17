/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./js/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "sans-serif"],
        serif: ['"DM Serif Display"', "serif"],
      },
      colors: {
        brand: {
          purple: "#534ab7",
          "purple-dark": "#3c3489",
          green: "#0f6e56",
          navy: "#1a1a2e",
        },
      },
      keyframes: {
        fadeSlideUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "spin-loader": {
          to: { transform: "translate(-50%, -50%) rotate(360deg)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-5px)" },
          "40%, 80%": { transform: "translateX(5px)" },
        },
      },
      animation: {
        "fade-slide-up": "fadeSlideUp 0.5s ease forwards",
        "spin-loader": "spin-loader 0.7s linear infinite",
        shake: "shake 0.4s ease",
      },
    },
  },
  plugins: [],
};
