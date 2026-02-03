import App from './App.svelte';
import { mount } from 'svelte';
import { initThumbnailBadges } from './thumbnails/index.js';

const host = document.createElement('div');
host.id = 'youtube-notes-root';
host.style.cssText =
  'all: initial; position: fixed; top: 0; left: 0; z-index: 2147483647; pointer-events: none;' +
  '--ytn-brand: #1565c0; --ytn-brand-hover: #0d47a1; --ytn-brand-light: #e3f2fd; --ytn-brand-light-hover: #bbdefb; --ytn-error: #e53935;';
document.body.appendChild(host);

const shadow = host.attachShadow({ mode: 'open' });

// Prevent keyboard events from reaching YouTube's shortcut handlers
for (const evt of ['keydown', 'keyup', 'keypress']) {
  host.addEventListener(evt, (e) => e.stopPropagation());
}

mount(App, { target: shadow });

initThumbnailBadges();
