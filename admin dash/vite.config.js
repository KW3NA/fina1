import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  css: {
    preprocessorOptions: {
      css: {
        include: /node_modules\/@fortawesome/,
      },
    },
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
})
