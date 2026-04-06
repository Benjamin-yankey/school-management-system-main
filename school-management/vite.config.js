import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500, // Large dashboards
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['jspdf', 'html2pdf.js', 'lucide-react']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://2e57-196-61-44-164.ngrok-free.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      },
    },
  },
});
