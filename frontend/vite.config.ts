import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Confirmed ASP.NET Core development endpoint from ClinicManagementSystem.http & launchSettings.json
      // Preparation only; zero API requests are triggered during this shell phase
      '/api': {
        target: 'http://localhost:5298',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5298',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
