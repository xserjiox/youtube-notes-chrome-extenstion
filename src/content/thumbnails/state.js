export const state = {
  noteCountMap: new Map(),
  observer: null,
  scanTimeout: null,
  activePanel: null,
  refreshBadges: null,
};

export function closePanel() {
  if (state.activePanel) {
    document.querySelector('.ytn-visible')?.classList.remove('ytn-visible');
    state.activePanel.remove();
    state.activePanel = null;
  }
}
