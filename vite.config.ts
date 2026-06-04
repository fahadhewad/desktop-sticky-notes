import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Renderer build. base './' so the packaged app loads assets via relative paths.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
