# YouTube Notes

A Chrome extension for taking timestamped notes while watching YouTube videos. Notes are stored locally - nothing leaves your browser.

## What it does

You click a floating button on any YouTube video, write a note, and the current timestamp gets saved with it. Later you can click the timestamp to jump back to that exact moment. That's it.

There's also a popup for quick access and a full-page view for browsing notes across all videos.

## Project structure

```
src/
  content/       → injected into YouTube pages (Shadow DOM)
  popup/         → extension popup (click the icon)
  page/          → full-page notes view
  background/    → service worker (badge counter)
  components/    → shared Svelte components
  lib/           → storage, i18n, utils, themes
```

Three separate Vite builds produce the output:

- **main** (`vite.config.js`) - popup and page as a standard Svelte app
- **content** (`vite.config.content.js`) - content script bundled as IIFE
- **service-worker** (`vite.config.sw.js`) - background script bundled as IIFE

The content script lives inside a Shadow DOM so YouTube's styles don't interfere.

## Tech

- Svelte 5
- Vite 7
- Chrome Extensions Manifest V3
- `chrome.storage.local` for persistence

## i18n

9 languages: English, French, German, Italian, Polish, Ukrainian, Arabic, Chinese, Japanese. Arabic has full RTL support.

Language switching happens at runtime through a custom i18n module (`src/lib/i18n.js`), not through `chrome.i18n`.

## Build

```
npm install
npm run build
```

Output goes to `dist/`. Load it in Chrome via `chrome://extensions` → "Load unpacked".

## Lint & format

```
npm run lint
npm run format
```
