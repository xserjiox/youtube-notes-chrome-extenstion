import { CLOSE_NOTES_EVENT } from '../../lib/constants.js';

export const state = {
  noteCountMap: new Map(),
  observer: null,
  scanTimeout: null,
  refreshBadges: null,
};

export function closePanel() {
  window.dispatchEvent(new CustomEvent(CLOSE_NOTES_EVENT));
}
