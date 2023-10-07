/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {}
  },
  plugins: [require('daisyui')],
  daisyui: {
    rtl: true,
    themes: [
      {
        dracula: {
          ...require('daisyui/src/theming/themes')['[data-theme=dracula]'],
          primary: '#ef4444',
          'primary-focus': '#dc2626',
          'base-200': 'hsl(231.43 14.894% 15.588%)',
          'base-300': 'hsl(231.43 14.894% 14.929%)'
        }
      }
    ]
  }
}
