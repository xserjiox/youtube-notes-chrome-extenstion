import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: 'src/background/service-worker.js',
      formats: ['iife'],
      name: 'YouTubeNotesSW',
      fileName: () => 'service-worker.js',
    },
  },
});
