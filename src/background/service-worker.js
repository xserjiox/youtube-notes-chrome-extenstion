// YouTube Notes - Service Worker (background)

import { parseVideoId } from '../lib/utils.js';
import { BRAND } from '../lib/constants.js';

chrome.runtime.onInstalled.addListener(() => {});

// Update badge when storage changes
chrome.storage.onChanged.addListener((changes) => {
  for (const key of Object.keys(changes)) {
    if (key.startsWith('meta:')) {
      updateBadge();
      return;
    }
  }
});

// Update badge when active tab changes
chrome.tabs.onActivated.addListener(() => updateBadge());
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) updateBadge();
});

async function updateBadge() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) {
      chrome.action.setBadgeText({ text: '' });
      return;
    }

    const videoId = parseVideoId(tab.url);

    if (!videoId) {
      chrome.action.setBadgeText({ text: '' });
      return;
    }

    const metaKey = `meta:${videoId}`;
    const result = await chrome.storage.local.get(metaKey);
    const meta = result[metaKey];
    const count = meta?.noteCount || 0;

    chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
    chrome.action.setBadgeBackgroundColor({ color: BRAND });
  } catch {
    // tab query can fail if no active window
  }
}
