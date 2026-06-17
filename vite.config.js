import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
    // Ignore .env changes — those are backend-only, no need to restart the frontend dev server
    watch: {
      ignored: ['**/.env', '**/.env.*', '**/server.js'],
    },
  },
  // Declare heavy deps upfront so Vite skips the source-crawl phase on every startup
  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'framer-motion',
      'react',
      'react-dom',
      'react/jsx-runtime',
      'cobe',
      'maath',
      'react-responsive',
    ],
  },
})
