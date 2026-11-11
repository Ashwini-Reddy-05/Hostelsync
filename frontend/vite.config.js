import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, requests to /api are forwarded to the Spring Boot backend,
// so the browser never talks to another port (no CORS or port mix-ups).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
