// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    watch: {
      usePolling: true, // Use polling if file changes are not detected
    },
  },
});