import App from './App.svelte';
import { mount } from 'svelte';
import { initLocale } from '../lib/i18n.js';

initLocale().then(() => {
  mount(App, { target: document.getElementById('app') });
});
