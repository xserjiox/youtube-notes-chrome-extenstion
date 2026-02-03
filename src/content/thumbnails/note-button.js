import { parseVideoId } from '../../lib/utils.js';
import { OPEN_NOTES_EVENT } from '../../lib/constants.js';
import { extractVideoTitle } from './title-extractor.js';
import { BTN_CLASS, PREVIEW_BTN_CLASS, createNoteIcon } from './styles.js';

export function createNoteButton(videoId, container) {
  const btn = document.createElement('button');
  btn.className = BTN_CLASS;
  btn.title = 'Notes';
  btn.appendChild(createNoteIcon(14, 2));

  btn.addEventListener('click', function handleNoteButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const title = extractVideoTitle(btn);
    window.dispatchEvent(new CustomEvent(OPEN_NOTES_EVENT, { detail: { videoId, title } }));
  });

  return btn;
}

export function injectPreviewButton() {
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
  btn.appendChild(createNoteIcon(14, 2));

  btn.addEventListener('click', function handlePreviewClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const title = extractVideoTitle(btn);
    window.dispatchEvent(new CustomEvent(OPEN_NOTES_EVENT, { detail: { videoId, title } }));
  });

  container.appendChild(btn);
}
