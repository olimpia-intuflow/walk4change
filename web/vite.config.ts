import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  // Served under /app/ (landing lives at / in the same deploy).
  // Build natywny (Capacitor) nadpisuje przez VITE_BASE=/ — webview serwuje
  // bundle z rootu https://localhost/ (spec 2026-07-13, cz. Android).
  base: process.env.VITE_BASE ?? '/app/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
