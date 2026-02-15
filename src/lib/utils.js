/**
 * Extract video ID from a YouTube URL.
 * Handles standard watch pages and Shorts.
 */
export function parseVideoId(url) {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('youtube.com')) return null;
    if (u.pathname.startsWith('/shorts/')) {
      return u.pathname.split('/')[2] || null;
    }
    return u.searchParams.get('v');
  } catch {
    return null;
  }
}

/**
 * Format seconds into MM:SS or H:MM:SS string.
 */
export function formatTimestamp(seconds) {
  if (seconds == null || seconds < 0) return null;
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/**
 * Parse a MM:SS or H:MM:SS string into total seconds.
 * Returns null if the format is invalid.
 */
export function parseTimestamp(str) {
  if (!str) return null;
  const parts = str.split(':').map(Number);
  if (parts.some((n) => isNaN(n) || !Number.isInteger(n))) return null;
  if (parts.length === 2) {
    const [m, s] = parts;
    if (s < 0 || s >= 60 || m < 0) return null;
    return m * 60 + s;
  }
  if (parts.length === 3) {
    const [h, m, s] = parts;
    if (s < 0 || s >= 60 || m < 0 || m >= 60 || h < 0) return null;
    return h * 3600 + m * 60 + s;
  }
  return null;
}

/**
 * Build a YouTube thumbnail URL from a video ID.
 */
export function getThumbnailUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

/**
 * Generate a short random ID.
 */
export function generateId() {
  return crypto.randomUUID();
}
