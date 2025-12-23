import type { Config } from 'tailwindcss';

// Tailwind v4 uses CSS-based configuration
// The @custom-variant directive in globals.css handles dark mode
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};

export default config;

