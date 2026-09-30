import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Standaard build: normale static site (dist/) voor je portfolio of iframe-hosting.
// Gebruik relatieve paden zodat de build ook werkt vanuit een submap.
export default defineConfig({
  plugins: [react()],
  base: './',
});
