// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    vue()
  ],
  server: {
    proxy: {

      '/map-tiles': {
        target: 'https://tile.openstreetmap.org', 
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/map-tiles/, ''), 
      }
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    host: true,
    port: 5173,
  },
});
