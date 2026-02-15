import App from './App.svelte';
import { mount } from 'svelte';
import { initLocale } from '../lib/i18n.js';
import { initTheme } from '../lib/theme.js';

Promise.all([initLocale(), initTheme()]).then(() => {
  mount(App, { target: document.getElementById('app') });
});
