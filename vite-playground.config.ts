import { fileURLToPath } from 'node:url';
import VueDevTools from 'vite-plugin-vue-devtools';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import VueStyleLayer from './src/index.js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueDevTools(),
    VueStyleLayer(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./playground', import.meta.url)),
    },
  },
  root: './playground',
});
