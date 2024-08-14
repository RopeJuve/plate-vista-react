/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // Enables dark mode using the 'class' strategy
    content: [
      './index.html',  // Adjust based on where your main HTML file is
      './src/**/*.{js,jsx,ts,tsx}',  // This tells Tailwind to scan these files for class names
    ],
    theme: {
      extend: {}, // Use this to extend the default Tailwind theme if needed
    },
    plugins: [], // Add any Tailwind plugins here if necessary
  };
  