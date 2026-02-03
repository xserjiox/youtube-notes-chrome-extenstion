import { generateId } from './utils.js';

// --- Operation serialization ---
// Prevents race conditions when multiple operations target the same videoId.

const _pending = new Map();

function _serialize(videoId, fn) {
  const prev = _pending.get(videoId) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  _pending.set(videoId, next);
  next.finally(() => {
    if (_pending.get(videoId) === next) _pending.delete(videoId);
  });
  return next;
}

// --- Notes ---

export async function getNotes(videoId) {
  const key = `notes:${videoId}`;
  const result = await chrome.storage.local.get(key);
  return result[key] || [];
}

export function addNote(videoId, text, timestamp = null) {
  return _serialize(videoId, async () => {
    const key = `notes:${videoId}`;
    const notes = await getNotes(videoId);
    const note = {
      id: generateId(),
      text,
      timestamp,
      createdAt: Date.now(),
    };
    notes.unshift(note);
    await chrome.storage.local.set({ [key]: notes });

    const meta = await getVideoMeta(videoId);
    await setVideoMeta(videoId, {
      ...meta,
      noteCount: notes.length,
      updatedAt: Date.now(),
    });

    return note;
  });
}

export function deleteNote(videoId, noteId) {
  return _serialize(videoId, async () => {
    const key = `notes:${videoId}`;
    let notes = await getNotes(videoId);
    notes = notes.filter((n) => n.id !== noteId);

    if (notes.length === 0) {
      await chrome.storage.local.remove([key, `meta:${videoId}`]);
    } else {
      await chrome.storage.local.set({ [key]: notes });
      const meta = await getVideoMeta(videoId);
      await setVideoMeta(videoId, {
        ...meta,
        noteCount: notes.length,
        updatedAt: Date.now(),
      });
    }

    return notes;
  });
}

export function updateNoteText(videoId, noteId, newText) {
  return _serialize(videoId, async () => {
    const key = `notes:${videoId}`;
    const notes = await getNotes(videoId);
    const note = notes.find((n) => n.id === noteId);
    if (!note) return notes;
    note.text = newText;
    await chrome.storage.local.set({ [key]: notes });

    const meta = await getVideoMeta(videoId);
    await setVideoMeta(videoId, { ...meta, updatedAt: Date.now() });

    return notes;
  });
}

// --- Video Meta ---

export async function getVideoMeta(videoId) {
  const key = `meta:${videoId}`;
  const result = await chrome.storage.local.get(key);
  return result[key] || { videoId, title: '', url: '', noteCount: 0, updatedAt: 0 };
}

export async function setVideoMeta(videoId, meta) {
  const key = `meta:${videoId}`;
  await chrome.storage.local.set({
    [key]: { videoId, ...meta, createdAt: meta.createdAt || Date.now() },
  });
}

export async function getAllVideosWithNotes() {
  const all = await chrome.storage.local.get(null);
  const videos = [];
  for (const [key, value] of Object.entries(all)) {
    if (key.startsWith('meta:') && value.noteCount > 0) {
      videos.push(value);
    }
  }
  videos.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  return videos;
}
