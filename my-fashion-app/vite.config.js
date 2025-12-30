import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // Use port 5174 to match the browser URL you shared (localhost:5174)
    port: 5174,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      // If your browser accesses the app through a different hostname, set it here.
    }
  }
})
