import { parseVideoId } from '../lib/utils.js';
import {
  getAllVideosWithNotes,
  getNotes,
  addNote,
  deleteNote,
  getVideoMeta,
  setVideoMeta,
} from '../lib/storage.js';

const BADGE_CLASS = 'yt-notes-thumb-badge';
const BTN_CLASS = 'yt-notes-thumb-btn';
const PROCESSED_ATTR = 'data-yt-notes';

// Selectors that cover the current YouTube DOM for video thumbnails
const THUMB_LINK_SELECTORS = [
  'a.yt-lockup-view-model__content-image[href*="/watch?v="]',
  'a#thumbnail[href*="/watch?v="]',
].join(', ');

const NOTE_ICON_SVG =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
  '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
  '<polyline points="14 2 14 8 20 8"/>' +
  '<line x1="16" y1="13" x2="8" y2="13"/>' +
  '<line x1="16" y1="17" x2="8" y2="17"/>' +
  '</svg>';

let noteCountMap = new Map();
let observer = null;
let scanTimeout = null;
let activePanel = null;
const PREVIEW_BTN_CLASS = 'yt-notes-preview-btn';

// --- Init ---

export function initThumbnailBadges() {
  loadNoteCounts().then(() => scanPage());

  observer = new MutationObserver(debouncedScan);
  observer.observe(document.body, { childList: true, subtree: true });

  chrome.storage.onChanged.addListener(handleStorageChange);
  window.addEventListener('yt-navigate-finish', onNavigate);

  setInterval(injectPreviewButton, 300);
}

function onNavigate() {
  closePanel();
  loadNoteCounts().then(() => scanPage());
}

async function loadNoteCounts() {
  const videos = await getAllVideosWithNotes();
  noteCountMap = new Map(videos.map((v) => [v.videoId, v.noteCount]));
}

function debouncedScan() {
  if (scanTimeout) clearTimeout(scanTimeout);
  scanTimeout = setTimeout(scanPage, 500);
}

// --- Preview button injection ---

function injectPreviewButton() {
  const container = document.querySelector('ytd-video-preview #player-container');
  if (!container) return;
  if (container.querySelector(`.${PREVIEW_BTN_CLASS}`)) return;

  const titleLink = container.querySelector('a.ytp-title-link[href]');
  if (!titleLink) return;
  const videoId = parseVideoId(titleLink.href);
  if (!videoId) return;

  container.style.position = 'relative';
  const btn = document.createElement('button');
  btn.className = PREVIEW_BTN_CLASS;
  btn.title = 'Notes';
  btn.innerHTML = NOTE_ICON_SVG;
  setStyles(btn, {
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(21, 101, 192, 0.85)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '200',
    opacity: '1',
    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
    padding: '0',
  });

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openPanel(videoId, btn);
  });

  container.appendChild(btn);
}

// --- Scan & inject buttons ---

function scanPage() {
  const links = document.querySelectorAll(THUMB_LINK_SELECTORS);

  for (const link of links) {
    const videoId = parseVideoId(link.href);
    if (!videoId) continue;

    // Find the visual thumbnail container
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

function updateBadge(container, videoId) {
  const count = noteCountMap.get(videoId) || 0;
  let badge = container.querySelector(`.${BADGE_CLASS}`);

  if (count > 0) {
    if (badge) {
      badge.lastElementChild.textContent = `${count}`;
    } else {
      badge = document.createElement('div');
      badge.className = BADGE_CLASS;
      setStyles(badge, {
        position: 'absolute',
        top: '14px',
        left: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        background: 'rgba(21, 101, 192, 0.85)',
        color: 'white',
        fontSize: '11px',
        fontWeight: '600',
        padding: '2px 6px',
        borderRadius: '4px',
        zIndex: '100',
        pointerEvents: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: '1',
      });
      const icon = document.createElement('span');
      icon.style.display = 'flex';
      icon.innerHTML =
        '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
        '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
        '<polyline points="14 2 14 8 20 8"/>' +
        '<line x1="16" y1="13" x2="8" y2="13"/>' +
        '<line x1="16" y1="17" x2="8" y2="17"/>' +
        '</svg>';
      const span = document.createElement('span');
      span.textContent = `${count}`;
      badge.appendChild(icon);
      badge.appendChild(span);
      container.appendChild(badge);
    }
  } else if (badge) {
    badge.remove();
  }
}

function createNoteButton(videoId, container) {
  const btn = document.createElement('button');
  btn.className = BTN_CLASS;
  btn.title = 'Notes';
  btn.innerHTML = NOTE_ICON_SVG;
  setStyles(btn, {
    position: 'absolute',
    bottom: '14px',
    left: '14px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(21, 101, 192, 0.85)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '200',
    opacity: '0',
    transition: 'opacity 0.15s',
    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
    padding: '0',
  });

  container.addEventListener('mouseenter', () => (btn.style.opacity = '1'));
  container.addEventListener('mouseleave', () => {
    if (!activePanel || activePanel.dataset.videoId !== videoId) {
      btn.style.opacity = '0';
    }
  });

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openPanel(videoId, btn);
  });

  return btn;
}

// --- Notes panel (modal) ---

function openPanel(videoId, anchorEl) {
  closePanel();

  const title = extractVideoTitle(anchorEl);

  const overlay = document.createElement('div');
  overlay.dataset.videoId = videoId;
  setStyles(overlay, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(0,0,0,0.4)',
    zIndex: '2147483646',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  });

  const panel = document.createElement('div');
  setStyles(panel, {
    background: 'white',
    borderRadius: '12px',
    width: '380px',
    maxWidth: '90vw',
    maxHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    overflow: 'hidden',
  });

  // Header
  const header = document.createElement('div');
  setStyles(header, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid #eee',
  });
  const titleEl = document.createElement('h3');
  titleEl.textContent = title || videoId;
  setStyles(titleEl, {
    margin: '0',
    fontSize: '14px',
    color: '#1a1a1a',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: '1',
    minWidth: '0',
  });
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  setStyles(closeBtn, {
    background: 'none',
    border: 'none',
    fontSize: '22px',
    color: '#999',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: '1',
    marginLeft: '8px',
  });
  closeBtn.addEventListener('click', closePanel);
  header.appendChild(titleEl);
  header.appendChild(closeBtn);

  // Body (notes list)
  const body = document.createElement('div');
  setStyles(body, {
    padding: '12px 16px',
    overflowY: 'auto',
    flex: '1',
  });

  // Footer (input)
  const footer = document.createElement('div');
  setStyles(footer, {
    padding: '12px 16px',
    borderTop: '1px solid #eee',
    display: 'flex',
    gap: '8px',
  });
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Add a note...';
  setStyles(input, {
    flex: '1',
    fontSize: '13px',
    padding: '6px 10px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    outline: 'none',
    fontFamily: 'inherit',
  });
  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add';
  setStyles(addBtn, {
    padding: '6px 14px',
    background: '#1565c0',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'inherit',
    fontWeight: '600',
  });

  async function submitNote() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    await addNote(videoId, text, null);
    const meta = await getVideoMeta(videoId);
    if (!meta.title && title) {
      await setVideoMeta(videoId, { ...meta, title });
    }
    await loadNoteCounts();
    scanPage();
    renderNotes(videoId, body);
  }

  addBtn.addEventListener('click', submitNote);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitNote();
  });
  for (const evt of ['keydown', 'keyup', 'keypress']) {
    input.addEventListener(evt, (e) => e.stopPropagation());
  }

  footer.appendChild(input);
  footer.appendChild(addBtn);

  panel.appendChild(header);
  panel.appendChild(body);
  panel.appendChild(footer);
  overlay.appendChild(panel);

  overlay.addEventListener('mousedown', (e) => {
    if (e.target === overlay) closePanel();
  });

  document.body.appendChild(overlay);
  activePanel = overlay;

  for (const evt of ['keydown', 'keyup', 'keypress']) {
    overlay.addEventListener(evt, (e) => {
      if (e.key === 'Escape') closePanel();
      e.stopPropagation();
    });
  }

  renderNotes(videoId, body);
  input.focus();
}

function closePanel() {
  if (activePanel) {
    activePanel.remove();
    activePanel = null;
  }
}

async function renderNotes(videoId, container) {
  const notes = await getNotes(videoId);
  container.innerHTML = '';

  if (notes.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'No notes yet.';
    setStyles(empty, { color: '#999', fontSize: '13px', margin: '8px 0' });
    container.appendChild(empty);
    return;
  }

  for (const note of notes) {
    const row = document.createElement('div');
    setStyles(row, {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      padding: '6px 0',
      borderBottom: '1px solid #f0f0f0',
    });

    const textEl = document.createElement('span');
    textEl.textContent = note.text;
    setStyles(textEl, {
      flex: '1',
      fontSize: '13px',
      color: '#1a1a1a',
      wordBreak: 'break-word',
    });

    const delBtn = document.createElement('button');
    delBtn.innerHTML = '&times;';
    delBtn.title = 'Delete';
    setStyles(delBtn, {
      background: 'none',
      border: 'none',
      color: '#999',
      fontSize: '16px',
      cursor: 'pointer',
      padding: '0 4px',
      lineHeight: '1',
      flexShrink: '0',
    });
    delBtn.addEventListener('mouseenter', () => (delBtn.style.color = '#e53935'));
    delBtn.addEventListener('mouseleave', () => (delBtn.style.color = '#999'));
    delBtn.addEventListener('click', async () => {
      await deleteNote(videoId, note.id);
      await loadNoteCounts();
      scanPage();
      renderNotes(videoId, container);
    });

    row.appendChild(textEl);
    row.appendChild(delBtn);
    container.appendChild(row);
  }
}

// --- Helpers ---

function extractVideoTitle(el) {
  // New YouTube layout: walk up to the lockup container
  const lockup = el.closest('yt-lockup-view-model, ytd-rich-item-renderer');
  if (lockup) {
    const titleEl =
      lockup.querySelector('.yt-lockup-metadata-view-model__title span') ||
      lockup.querySelector('#video-title');
    if (titleEl) return titleEl.textContent?.trim() || '';
  }
  // Fallback for other layouts
  const renderer = el.closest(
    'ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer',
  );
  if (renderer) {
    const titleEl = renderer.querySelector('#video-title');
    if (titleEl) return titleEl.textContent?.trim() || titleEl.getAttribute('title') || '';
  }
  return '';
}

function setStyles(el, styles) {
  Object.assign(el.style, styles);
}

function handleStorageChange(changes) {
  for (const key of Object.keys(changes)) {
    if (key.startsWith('meta:') || key.startsWith('notes:')) {
      loadNoteCounts().then(() => scanPage());
      return;
    }
  }
}
