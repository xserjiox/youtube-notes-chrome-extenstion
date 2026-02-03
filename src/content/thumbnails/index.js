import { state, closePanel } from './state.js';
import { injectStyles, removeStyles, BADGE_CLASS, BTN_CLASS, PREVIEW_BTN_CLASS, PROCESSED_ATTR } from './styles.js';
import { refreshBadges, debouncedScan, onNavigate, handleStorageChange } from './scanner.js';

export function initThumbnailBadges() {
  injectStyles();

  state.refreshBadges = refreshBadges;
  refreshBadges();

  state.observer = new MutationObserver(debouncedScan);
  state.observer.observe(document.body, { childList: true, subtree: true });

  chrome.storage.onChanged.addListener(handleStorageChange);
  window.addEventListener('yt-navigate-finish', onNavigate);
}

export function destroyThumbnailBadges() {
  if (state.observer) {
    state.observer.disconnect();
    state.observer = null;
  }

  if (state.scanTimeout) {
    clearTimeout(state.scanTimeout);
    state.scanTimeout = null;
  }

  chrome.storage.onChanged.removeListener(handleStorageChange);
  window.removeEventListener('yt-navigate-finish', onNavigate);

  closePanel();

  for (const el of document.querySelectorAll(
    `.${BADGE_CLASS}, .${BTN_CLASS}, .${PREVIEW_BTN_CLASS}`,
  )) {
    el.remove();
  }

  for (const el of document.querySelectorAll(`[${PROCESSED_ATTR}]`)) {
    el.removeAttribute(PROCESSED_ATTR);
  }

  removeStyles();

  state.noteCountMap.clear();
  state.refreshBadges = null;
}
