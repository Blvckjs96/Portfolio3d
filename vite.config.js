import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
    watch: {
      ignored: ['**/.env', '**/.env.*', '**/server.js'],
    },
  },
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
      'lucide-react',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei', 'maath'],
          'motion-vendor': ['framer-motion'],
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
})
