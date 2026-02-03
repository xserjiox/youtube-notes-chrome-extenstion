import { state, closePanel } from './state.js';
import { createNoteIcon } from './styles.js';
import { extractVideoTitle } from './title-extractor.js';
import { getNotes, addNote, deleteNote, getVideoMeta, setVideoMeta } from '../../lib/storage.js';

function blockYouTubeKeyCapture(element) {
  // YouTube listens for keydown/keyup/keypress on the document and triggers
  // player shortcuts (e.g. 'k' for pause). Stopping propagation on our
  // interactive elements prevents those shortcuts from firing while the user
  // types inside the notes panel.
  for (const evt of ['keydown', 'keyup', 'keypress']) {
    element.addEventListener(evt, (e) => e.stopPropagation());
  }
}

function createOverlay(videoId) {
  const overlay = document.createElement('div');
  overlay.className = 'ytn-overlay';
  overlay.dataset.videoId = videoId;
  return overlay;
}

function createPanelShell() {
  const panel = document.createElement('div');
  panel.className = 'ytn-panel';
  return panel;
}

function createPanelHeader(title, videoId) {
  const header = document.createElement('div');
  header.className = 'ytn-panel-header';

  const titleEl = document.createElement('h3');
  titleEl.className = 'ytn-panel-title';
  titleEl.textContent = title || videoId;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'ytn-panel-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', closePanel);

  header.appendChild(titleEl);
  header.appendChild(closeBtn);
  return header;
}

function createPanelBody() {
  const body = document.createElement('div');
  body.className = 'ytn-panel-body';
  return body;
}

function createPanelFooter(videoId, title, body) {
  const footer = document.createElement('div');
  footer.className = 'ytn-panel-footer';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Add a note...';
  input.className = 'ytn-panel-input';

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add';
  addBtn.className = 'ytn-panel-add-btn';

  let submitting = false;

  async function submitNote() {
    const text = input.value.trim();
    if (!text || submitting) return;
    submitting = true;
    addBtn.disabled = true;
    input.value = '';
    try {
      await addNote(videoId, text, null);
      const meta = await getVideoMeta(videoId);
      if (!meta.title && title) {
        await setVideoMeta(videoId, { ...meta, title });
      }
      await state.refreshBadges?.();
      renderNotes(videoId, body);
    } catch (err) {
      console.error('[YT-Notes] Failed to submit note:', err);
      input.value = text;
    } finally {
      submitting = false;
      addBtn.disabled = false;
    }
  }

  addBtn.addEventListener('click', submitNote);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitNote();
  });
  blockYouTubeKeyCapture(input);

  footer.appendChild(input);
  footer.appendChild(addBtn);
  return { footer, input };
}

async function renderNotes(videoId, container) {
  try {
    const notes = await getNotes(videoId);
    container.replaceChildren();

    if (notes.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'ytn-empty';
      empty.textContent = 'No notes yet.';
      container.appendChild(empty);
      return;
    }

    for (const note of notes) {
      const row = document.createElement('div');
      row.className = 'ytn-note-row';

      const textEl = document.createElement('span');
      textEl.className = 'ytn-note-text';
      textEl.textContent = note.text;

      const delBtn = document.createElement('button');
      delBtn.className = 'ytn-note-delete';
      delBtn.innerHTML = '&times;';
      delBtn.title = 'Delete';

      delBtn.addEventListener('click', async () => {
        try {
          await deleteNote(videoId, note.id);
          await state.refreshBadges?.();
          renderNotes(videoId, container);
        } catch (err) {
          console.error('[YT-Notes] Failed to delete note:', err);
        }
      });

      row.appendChild(textEl);
      row.appendChild(delBtn);
      container.appendChild(row);
    }
  } catch (err) {
    console.error('[YT-Notes] Failed to load notes:', err);
    container.replaceChildren();
    const errorEl = document.createElement('p');
    errorEl.className = 'ytn-error';
    errorEl.textContent = 'Failed to load notes';
    container.appendChild(errorEl);
  }
}

export function openPanel(videoId, anchorEl) {
  closePanel();

  const title = extractVideoTitle(anchorEl);
  const overlay = createOverlay(videoId);
  const panel = createPanelShell();
  const header = createPanelHeader(title, videoId);
  const body = createPanelBody();
  const { footer, input } = createPanelFooter(videoId, title, body);

  panel.appendChild(header);
  panel.appendChild(body);
  panel.appendChild(footer);
  overlay.appendChild(panel);

  overlay.addEventListener('mousedown', (e) => {
    if (e.target === overlay) closePanel();
  });

  blockYouTubeKeyCapture(overlay);
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  document.body.appendChild(overlay);
  state.activePanel = overlay;

  renderNotes(videoId, body);
  input.focus();
}
