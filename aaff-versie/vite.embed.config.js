import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Embed build: alles (JS + CSS) in EEN enkel HTML-bestand (dist-embed/index.html).
// Handig om te delen: upload dit bestand ergens en verwijs ernaar met een iframe,
// of gebruik het als standalone bestand op SharePoint / je website.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  build: {
    outDir: 'dist-embed',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
