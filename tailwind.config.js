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
        'paper': {
          DEFAULT: 'var(--color-paper)',
          dark: 'var(--color-paper-dark)'
        },
        'leather': 'var(--color-leather)',
        'text': {
          DEFAULT: 'var(--color-text)',
          dark: 'var(--color-text-dark)'
        },
        'secondary': {
          DEFAULT: 'var(--color-secondary)',
          dark: 'var(--color-secondary-dark)'
        }
      },
      fontFamily: {
        heading: ['Merriweather', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Source Code Pro', 'monospace'],
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
