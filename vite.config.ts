import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH задаётся в GitHub Actions (/<repo>/). Локально сайт работает от корня.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
});
