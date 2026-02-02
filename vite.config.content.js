import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        css: 'injected',
      },
      emitCss: false,
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: 'src/content/main.js',
      name: 'YouTubeNotesContent',
      formats: ['iife'],
      fileName: () => 'content.js',
    },
  },
});
