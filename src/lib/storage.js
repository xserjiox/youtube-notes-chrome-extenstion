import { generateId } from './utils.js';

// --- Notes ---

export async function getNotes(videoId) {
  const key = `notes:${videoId}`;
  const result = await chrome.storage.local.get(key);
  return result[key] || [];
}

export async function addNote(videoId, text, timestamp = null) {
  const key = `notes:${videoId}`;
  const notes = await getNotes(videoId);
  const note = {
    id: generateId(),
    text,
    timestamp,
    createdAt: Date.now(),
  };
  notes.push(note);
  await chrome.storage.local.set({ [key]: notes });

  // Update meta
  const meta = await getVideoMeta(videoId);
  await setVideoMeta(videoId, {
    ...meta,
    noteCount: notes.length,
    updatedAt: Date.now(),
  });

  return note;
}

export async function deleteNote(videoId, noteId) {
  const key = `notes:${videoId}`;
  let notes = await getNotes(videoId);
  notes = notes.filter((n) => n.id !== noteId);
  await chrome.storage.local.set({ [key]: notes });

  const meta = await getVideoMeta(videoId);
  if (notes.length === 0) {
    // Remove meta and notes keys when no notes left
    await chrome.storage.local.remove([key, `meta:${videoId}`]);
  } else {
    await setVideoMeta(videoId, {
      ...meta,
      noteCount: notes.length,
      updatedAt: Date.now(),
    });
  }

  return notes;
}

export async function updateNoteText(videoId, noteId, newText) {
  const key = `notes:${videoId}`;
  const notes = await getNotes(videoId);
  const note = notes.find((n) => n.id === noteId);
  if (!note) return notes;
  note.text = newText;
  await chrome.storage.local.set({ [key]: notes });

  const meta = await getVideoMeta(videoId);
  await setVideoMeta(videoId, { ...meta, updatedAt: Date.now() });

  return notes;
}

// --- Video Meta ---

export async function getVideoMeta(videoId) {
  const key = `meta:${videoId}`;
  const result = await chrome.storage.local.get(key);
  return result[key] || { videoId, title: '', url: '', noteCount: 0, updatedAt: 0 };
}

export async function setVideoMeta(videoId, meta) {
  const key = `meta:${videoId}`;
  await chrome.storage.local.set({ [key]: { videoId, ...meta } });
}

export async function getAllVideosWithNotes() {
  const all = await chrome.storage.local.get(null);
  const videos = [];
  for (const [key, value] of Object.entries(all)) {
    if (key.startsWith('meta:') && value.noteCount > 0) {
      videos.push(value);
    }
  }
  videos.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  return videos;
}
