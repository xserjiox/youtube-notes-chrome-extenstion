import { BRAND, FAB_BG, FAB_BG_HOVER, FAB_ICON_COLOR, FAB_SHADOW } from '../../lib/constants.js';

export const DEBOUNCE_MS = 500;
const Z_OVERLAY = 2147483646;
const Z_BADGE = 100;
const Z_BUTTON = 200;
export const STYLE_ELEMENT_ID = 'yt-notes-thumb-styles';

export const BADGE_CLASS = 'yt-notes-thumb-badge';
export const BTN_CLASS = 'yt-notes-thumb-btn';
export const PREVIEW_BTN_CLASS = 'yt-notes-preview-btn';
export const PROCESSED_ATTR = 'data-yt-notes';

const CSS = `
.${BTN_CLASS},
.${PREVIEW_BTN_CLASS} {
  position: absolute;
  bottom: 14px;
  left: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: ${FAB_BG};
  color: ${FAB_ICON_COLOR};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${Z_BUTTON};
  box-shadow: ${FAB_SHADOW};
  padding: 0;
  transition: background 0.15s;
}

.${BTN_CLASS}:hover,
.${PREVIEW_BTN_CLASS}:hover {
  background: ${FAB_BG_HOVER};
}

.${BTN_CLASS} {
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;
}

[${PROCESSED_ATTR}]:hover > .${BTN_CLASS} {
  opacity: 1;
}

.${BTN_CLASS}.ytn-visible {
  opacity: 1;
}

.${PREVIEW_BTN_CLASS} {
  bottom: 16px;
  left: 16px;
  opacity: 1;
}

.${BADGE_CLASS} {
  position: absolute;
  top: 14px;
  left: 14px;
  display: flex;
  align-items: center;
  gap: 3px;
  background: ${FAB_BG};
  color: ${FAB_ICON_COLOR};
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  z-index: ${Z_BADGE};
  pointer-events: none;
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1;
}

.ytn-badge-icon {
  display: flex;
}

.ytn-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: ${Z_OVERLAY};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: system-ui, -apple-system, sans-serif;
}

.ytn-panel {
  background: white;
  border-radius: 12px;
  width: 380px;
  max-width: 90vw;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  overflow: hidden;
}

.ytn-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
}

.ytn-panel-title {
  margin: 0;
  font-size: 14px;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.ytn-panel-close {
  background: none;
  border: none;
  font-size: 22px;
  color: #999;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  margin-left: 8px;
}

.ytn-panel-body {
  padding: 12px 16px;
  overflow-y: auto;
  flex: 1;
}

.ytn-panel-footer {
  padding: 12px 16px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
}

.ytn-panel-input {
  flex: 1;
  font-size: 13px;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  outline: none;
  font-family: inherit;
}

.ytn-panel-add-btn {
  padding: 6px 14px;
  background: ${BRAND};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  font-weight: 600;
}

.ytn-panel-add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ytn-note-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.ytn-note-text {
  flex: 1;
  font-size: 13px;
  color: #1a1a1a;
  word-break: break-word;
}

.ytn-note-delete {
  background: none;
  border: none;
  color: #999;
  font-size: 16px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  flex-shrink: 0;
}

.ytn-note-delete:hover {
  color: #e53935;
}

.ytn-empty {
  color: #999;
  font-size: 13px;
  margin: 8px 0;
}

.ytn-error {
  color: #e53935;
  font-size: 13px;
  margin: 8px 0;
}
`;

const noteIconTemplate = document.createElement('template');
noteIconTemplate.innerHTML =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">' +
  '<rect x="3" y="7" width="12" height="15" rx="2"/>' +
  '<path d="M9 7V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-3"/>' +
  '</svg>';

export function createNoteIcon(size, strokeWidth) {
  const svg = noteIconTemplate.content.firstElementChild.cloneNode(true);
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('stroke-width', String(strokeWidth));
  return svg;
}

export function injectStyles() {
  if (document.getElementById(STYLE_ELEMENT_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

export function removeStyles() {
  document.getElementById(STYLE_ELEMENT_ID)?.remove();
}
