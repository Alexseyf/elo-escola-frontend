import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-nunito-sans)', 'sans-serif'],
        display: ['var(--font-nunito-sans)', 'sans-serif'],
      },
      colors: {
        soft: {
          blue: {
            DEFAULT: '#f0f7ff',
            foreground: '#2563eb', // blue-600
            border: '#dbeafe', // blue-100
          },
          green: {
            DEFAULT: '#f0fdf4',
            foreground: '#16a34a', // green-600
            border: '#dcfce7', // green-100
          },
          gray: {
            DEFAULT: '#fafafa',
            border: '#f3f4f6', // gray-100
          },
          brand: '#F9FBFF',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
      }
    },
  },
  plugins: [],
}

export default config
