import { defineConfig } from 'vite';

// GitHub Pages serves this project from https://<user>.github.io/legless/
// so the base path must match the repository name.
export default defineConfig({
  base: '/legless/',
  build: {
    outDir: 'dist',
  },
});
