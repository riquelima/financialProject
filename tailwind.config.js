/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./screens/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}", // If you move files to src
  ],
  theme: {
    extend: {
      colors: {
        'emerald-lime': '#00FFB2',
        'amethyst-purple': '#A64AC9',
        'electric-blue': '#00BFFF',
        'soft-magenta': '#FF55AA',
        'coral-red': '#FF6B6B',
        // Theme-dependent colors are better handled with CSS variables
        // but you can define them here if you prefer for specific one-off cases.
        'primary-bg': 'var(--primary-bg)',
        'secondary-bg': 'var(--secondary-bg)',
        'tertiary-bg': 'var(--tertiary-bg)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-accent': 'var(--text-accent)',
        'input-bg': 'var(--input-bg)',
        'input-border': 'var(--input-border)',
        'input-focus-border': 'var(--input-focus-border)',
        'card-border': 'var(--card-border)',
        'card-border-light': 'var(--card-border-light)',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        '10px': '10px',
        '14px': '14px',
      },
      boxShadow: {
         'input-focus-shadow': '0 0 3px 0px var(--input-focus-shadow)',
      }
    },
  },
  plugins: [],
};