// YouTube Notes - Service Worker (background)

chrome.runtime.onInstalled.addListener(() => {
  console.log('YouTube Notes extension installed');
});

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

    let videoId = null;
    try {
      const url = new URL(tab.url);
      if (url.hostname.includes('youtube.com')) {
        if (url.pathname.startsWith('/shorts/')) {
          videoId = url.pathname.split('/')[2] || null;
        } else {
          videoId = url.searchParams.get('v');
        }
      }
    } catch {
      // invalid URL
    }

    if (!videoId) {
      chrome.action.setBadgeText({ text: '' });
      return;
    }

    const metaKey = `meta:${videoId}`;
    const result = await chrome.storage.local.get(metaKey);
    const meta = result[metaKey];
    const count = meta?.noteCount || 0;

    chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#1565c0' });
  } catch {
    // tab query can fail if no active window
  }
}
