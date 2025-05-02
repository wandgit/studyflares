/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode
        'paper': 'var(--color-paper)',
        'leather': 'var(--color-leather)',
        'text': 'var(--color-text)',
        'secondary': 'var(--color-secondary)',
        
        // Dark mode
        'dark-leather': 'var(--color-dark-leather)',
        'light-beige': 'var(--color-light-beige)',
        'medium-brown': 'var(--color-medium-brown)',
      },
      fontFamily: {
        handwriting: ['Caveat', 'cursive'],
        sans: ['Roboto', 'Open Sans', 'sans-serif'],
        mono: ['Fira Code', 'Source Code Pro', 'monospace'],
      },
      boxShadow: {
        'neu-light': '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff',
        'neu-dark': '5px 5px 10px #3a2c1f, -5px -5px 10px #5a4231',
        'neu-pressed-light': 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
        'neu-pressed-dark': 'inset 5px 5px 10px #3a2c1f, inset -5px -5px 10px #5a4231',
      },
    },
  },
  plugins: [],
}
