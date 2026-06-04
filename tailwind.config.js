/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Colours are driven by CSS variables so the whole UI can re-theme
      // itself from the desktop wallpaper at runtime.
      colors: {
        glass: 'var(--glass)',
        'glass-strong': 'var(--glass-strong)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        line: 'var(--line)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}
