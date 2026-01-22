/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        'lcars-bg': '#07121a',
        'lcars-panel': '#0f1f28',
        'lcars-orange': '#ff7a00',
        'lcars-tan': '#ffd8a8',
        'lcars-blue': '#46e0ff',
        'lcars-pink': '#ff8fcf',
        'lcars-text': '#e6f6ff',
      },
    },
  },
  plugins: [],
}
