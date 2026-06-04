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
        sans: ['Inter Variable', 'Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(0,0,0,0.35)',
        // Depth + a hairline top highlight for the frosted-glass edge. Named
        // 'card' (not 'glass') to avoid colliding with the 'glass' color, which
        // would otherwise turn `shadow-glass` into a shadow-color utility.
        card: '0 24px 70px -24px rgba(0,0,0,0.5), inset 0 1px 0 0 rgba(255,255,255,0.14)',
      },
    },
  },
  plugins: [],
}
