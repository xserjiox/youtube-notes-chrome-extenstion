import { parseVideoId } from '../../lib/utils.js';
import { OPEN_NOTES_EVENT } from '../../lib/constants.js';
import { msg } from '../../lib/i18n.js';
import { extractVideoTitle } from './title-extractor.js';
import { BTN_CLASS, PREVIEW_BTN_CLASS, createNoteIcon } from './styles.js';

function createButton(className, videoId) {
  const btn = document.createElement('button');
  btn.className = className;
  btn.title = msg('thumbnail_notes');
  btn.appendChild(createNoteIcon(14, 2));

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const title = extractVideoTitle(btn);
    window.dispatchEvent(new CustomEvent(OPEN_NOTES_EVENT, { detail: { videoId, title } }));
  });

  return btn;
}

export function createNoteButton(videoId) {
  return createButton(BTN_CLASS, videoId);
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
  container.appendChild(createButton(PREVIEW_BTN_CLASS, videoId));
}
