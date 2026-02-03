import App from './App.svelte';
import { mount } from 'svelte';
import { initThumbnailBadges } from './thumbnails/index.js';
import {
  BRAND, BRAND_HOVER, BRAND_LIGHT, BRAND_LIGHT_HOVER, ERROR_COLOR,
  FAB_BG, FAB_BG_HOVER, FAB_ICON_COLOR, FAB_SHADOW,
} from '../lib/constants.js';

const host = document.createElement('div');
host.id = 'youtube-notes-root';
host.style.cssText =
  'all: initial; position: fixed; top: 0; left: 0; z-index: 2147483647; pointer-events: none;' +
  `--ytn-brand: ${BRAND}; --ytn-brand-hover: ${BRAND_HOVER}; --ytn-brand-light: ${BRAND_LIGHT}; --ytn-brand-light-hover: ${BRAND_LIGHT_HOVER}; --ytn-error: ${ERROR_COLOR};` +
  `--ytn-fab-bg: ${FAB_BG}; --ytn-fab-bg-hover: ${FAB_BG_HOVER}; --ytn-fab-icon-color: ${FAB_ICON_COLOR}; --ytn-fab-shadow: ${FAB_SHADOW};`;
document.body.appendChild(host);

const shadow = host.attachShadow({ mode: 'open' });

// Prevent keyboard events from reaching YouTube's shortcut handlers
for (const evt of ['keydown', 'keyup', 'keypress']) {
  host.addEventListener(evt, (e) => e.stopPropagation());
}

mount(App, { target: shadow });

initThumbnailBadges();
