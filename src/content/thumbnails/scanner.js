import { state, closePanel } from './state.js';
import { parseVideoId } from '../../lib/utils.js';
import { getAllVideosWithNotes } from '../../lib/storage.js';
import { PROCESSED_ATTR, DEBOUNCE_MS } from './styles.js';
import { updateBadge } from './badge.js';
import { createNoteButton, injectPreviewButton } from './note-button.js';

const THUMB_LINK_SELECTORS = [
  'a.yt-lockup-view-model__content-image[href*="/watch?v="]',
  'a#thumbnail[href*="/watch?v="]',
].join(', ');

async function loadNoteCounts() {
  try {
    const videos = await getAllVideosWithNotes();
    state.noteCountMap = new Map(videos.map((v) => [v.videoId, v.noteCount]));
  } catch (err) {
    console.error('[YT-Notes] Failed to load note counts:', err);
  }
}

function scanPage() {
  const links = document.querySelectorAll(THUMB_LINK_SELECTORS);

  for (const link of links) {
    const videoId = parseVideoId(link.href);
    if (!videoId) continue;

    const thumbView =
      link.querySelector('yt-thumbnail-view-model') ||
      link.closest('ytd-thumbnail') ||
      link;

    if (thumbView.getAttribute(PROCESSED_ATTR) === videoId) {
      updateBadge(thumbView, videoId);
      continue;
    }

    thumbView.setAttribute(PROCESSED_ATTR, videoId);
    thumbView.style.position = 'relative';

    thumbView.appendChild(createNoteButton(videoId, thumbView));
    updateBadge(thumbView, videoId);
  }
}

export async function refreshBadges() {
  await loadNoteCounts();
  scanPage();
  injectPreviewButton();
}

export function debouncedScan() {
  if (state.scanTimeout) clearTimeout(state.scanTimeout);
  state.scanTimeout = setTimeout(() => {
    scanPage();
    injectPreviewButton();
  }, DEBOUNCE_MS);
}

export function onNavigate() {
  closePanel();
  refreshBadges();
}

export function handleStorageChange(changes) {
  for (const key of Object.keys(changes)) {
    if (key.startsWith('meta:') || key.startsWith('notes:')) {
      refreshBadges().catch((err) =>
        console.error('[YT-Notes] Failed to handle storage change:', err),
      );
      return;
    }
  }
}
