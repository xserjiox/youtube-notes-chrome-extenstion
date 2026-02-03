export function extractVideoTitle(el) {
  const lockup = el.closest('yt-lockup-view-model, ytd-rich-item-renderer');
  if (lockup) {
    const titleEl =
      lockup.querySelector('.yt-lockup-metadata-view-model__title span') ||
      lockup.querySelector('#video-title');
    if (titleEl) return titleEl.textContent?.trim() || '';
  }
  const renderer = el.closest(
    'ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer',
  );
  if (renderer) {
    const titleEl = renderer.querySelector('#video-title');
    if (titleEl) return titleEl.textContent?.trim() || titleEl.getAttribute('title') || '';
  }
  return '';
}
