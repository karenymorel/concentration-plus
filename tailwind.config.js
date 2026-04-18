/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Creamos colores que referencian a variables CSS
        "custom-bg": "var(--bg-app)",
        "custom-sidebar": "var(--bg-side)",
        "custom-text": "var(--text-app)",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light"], // Solo dejamos light para que no moleste
  },
};
