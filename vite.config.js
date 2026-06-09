import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // '/meepled-ui/' when deployed to GitHub Pages; '/' locally
  base: process.env.GITHUB_ACTIONS ? '/meepled-ui/' : '/',
  server: {
    port: 5173,
  },
});
