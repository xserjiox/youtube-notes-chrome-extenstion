import { state } from './state.js';
import { BADGE_CLASS, createNoteIcon } from './styles.js';

function createBadge(count) {
  const badge = document.createElement('div');
  badge.className = BADGE_CLASS;

  const icon = document.createElement('span');
  icon.className = 'ytn-badge-icon';
  icon.appendChild(createNoteIcon(10, 2.5));

  const span = document.createElement('span');
  span.textContent = `${count}`;

  badge.appendChild(icon);
  badge.appendChild(span);
  return badge;
}

export function updateBadge(container, videoId) {
  const count = state.noteCountMap.get(videoId) || 0;
  const badge = container.querySelector(`.${BADGE_CLASS}`);

  if (count === 0) {
    badge?.remove();
    return;
  }

  if (badge) {
    badge.lastElementChild.textContent = `${count}`;
    return;
  }

  container.appendChild(createBadge(count));
}
