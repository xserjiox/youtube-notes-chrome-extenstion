import App from './App.svelte';
import { mount } from 'svelte';
import { initThumbnailBadges } from './thumbnails/index.js';
import { initLocale } from '../lib/i18n.js';
import { initTheme, setThemeTarget } from '../lib/theme.js';
import {
  BRAND, BRAND_HOVER, ERROR_COLOR,
  FAB_BG, FAB_BG_HOVER, FAB_ICON_COLOR, FAB_SHADOW,
} from '../lib/constants.js';

const host = document.createElement('div');
host.id = 'youtube-notes-root';
host.style.cssText =
  'all: initial; position: fixed; top: 0; left: 0; z-index: 2147483647; pointer-events: none;';
document.body.appendChild(host);

const shadow = host.attachShadow({ mode: 'open' });

// Inject theme CSS variables into shadow DOM
const themeStyle = document.createElement('style');
themeStyle.textContent = `
  :host {
    --ytn-brand: ${BRAND};
    --ytn-brand-hover: ${BRAND_HOVER};
    --ytn-brand-light: #fce4e4;
    --ytn-brand-light-hover: #f5c6c6;
    --ytn-error: ${ERROR_COLOR};
    --ytn-fab-bg: ${FAB_BG};
    --ytn-fab-bg-hover: ${FAB_BG_HOVER};
    --ytn-fab-icon-color: ${FAB_ICON_COLOR};
    --ytn-fab-shadow: ${FAB_SHADOW};
    --ytn-bg: #fafafa;
    --ytn-surface: #fff;
    --ytn-surface-hover: #f5f5f5;
    --ytn-input-bg: #f5f5f5;
    --ytn-input-bg-focus: #f0f0f0;
    --ytn-text: #1a1a1a;
    --ytn-text-secondary: #555;
    --ytn-text-muted: #999;
    --ytn-border: #ddd;
    --ytn-border-light: #eee;
    --ytn-link: #1a73e8;
    --ytn-icon: #666;
    --ytn-icon-muted: #999;
    --ytn-btn-primary-bg: #333;
    --ytn-btn-primary-text: #fff;
    --ytn-btn-primary-hover: #444;
    --ytn-shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
    --ytn-shadow-md: 0 1px 4px rgba(0,0,0,0.08);
    --ytn-shadow-lg: 0 8px 32px rgba(0,0,0,0.2);
    --ytn-backdrop: rgba(0,0,0,0.5);
  }
  :host([data-theme="dark"]) {
    --ytn-brand-light: #3d2020;
    --ytn-brand-light-hover: #4d2a2a;
    --ytn-bg: #181818;
    --ytn-surface: #282828;
    --ytn-surface-hover: #333;
    --ytn-input-bg: #333;
    --ytn-input-bg-focus: #3a3a3a;
    --ytn-text: #e0e0e0;
    --ytn-text-secondary: #aaa;
    --ytn-text-muted: #666;
    --ytn-border: #444;
    --ytn-border-light: #333;
    --ytn-link: #6eb5ff;
    --ytn-icon: #999;
    --ytn-icon-muted: #666;
    --ytn-btn-primary-bg: #e0e0e0;
    --ytn-btn-primary-text: #1a1a1a;
    --ytn-btn-primary-hover: #ccc;
    --ytn-shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
    --ytn-shadow-md: 0 1px 4px rgba(0,0,0,0.4);
    --ytn-shadow-lg: 0 8px 32px rgba(0,0,0,0.5);
    --ytn-backdrop: rgba(0,0,0,0.7);
  }
`;
shadow.appendChild(themeStyle);

// Prevent keyboard events from reaching YouTube's shortcut handlers
for (const evt of ['keydown', 'keyup', 'keypress']) {
  host.addEventListener(evt, (e) => e.stopPropagation());
}

setThemeTarget(host);

Promise.all([initLocale(), initTheme()]).then(() => {
  mount(App, { target: shadow });
});

initThumbnailBadges();
