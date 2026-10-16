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
        brand: {
          orange: '#F97316',
          'orange-dark': '#EA6C0A',
          blue: '#2D2F7E',
          'blue-light': '#3B3FA8',
          teal: '#14B8A6',
          navy: '#1E2A3A',
        },
        bg: {
          cream: '#FFF8F0',
          card: '#FDDCAA',
          'card-warm': '#FEE4B3',
          dark: '#1E2A3A',
        },
        text: {
          primary: '#1E293B',
          body: '#4B5563',
          muted: '#9CA3AF',
        },
        meeting: {
          bg: '#0D1117',
          panel: '#161B27',
          surface: '#1A2233',
          accent: '#2563EB',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
export default config
