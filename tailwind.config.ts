import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'allegro-orange': '#ff5a00',
        'allegro-orange-dark': '#e54900',
        'allegro-gray': '#f5f5f5',
        'allegro-dark-gray': '#333333',
        'krakow-orange': '#ff5a00',
        'krakow-orange-dark': '#e54900',
        'krakow-gray': '#f5f5f5',
        'krakow-dark-gray': '#333333',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
export default config
