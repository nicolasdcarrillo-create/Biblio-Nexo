/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./escaneo-remoto.html",
    "./privacidad.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        patrimonio: {
          lago: '#003348',
          madera: '#8B4513',
          bosque: '#2E472D',
          piedra: '#8B8C89',
          card: '#F4F1EA',
        }
      },
      fontFamily: {
        serif: ['Lora', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
