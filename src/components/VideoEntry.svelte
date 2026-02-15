<script>
  import { getThumbnailUrl } from '../lib/utils.js';

  let { video, onclick } = $props();

  function getRelativeTime(timestamp) {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
  }
</script>

<button class="video-entry" onclick={() => onclick(video)}>
  <img class="thumbnail" src={getThumbnailUrl(video.videoId)} alt="" />
  <div class="video-info">
    <span class="video-title">{video.title || video.videoId}</span>
    <div class="video-meta">
      <span class="meta-time">{getRelativeTime(video.updatedAt)}</span>
      <span class="meta-sep">&middot;</span>
      <svg class="meta-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
      <span class="meta-notes">{video.noteCount} note{video.noteCount === 1 ? '' : 's'}</span>
    </div>
  </div>
  <span class="badge">{video.noteCount}</span>
</button>

<style>
  .video-entry {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    transition: box-shadow 0.15s, border-color 0.15s;
    box-sizing: border-box;
  }

  .video-entry:hover {
    border-color: #ccc;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .thumbnail {
    flex-shrink: 0;
    width: 80px;
    height: 45px;
    border-radius: 6px;
    object-fit: cover;
    margin-right: 10px;
  }

  .video-info {
    flex: 1;
    min-width: 0;
  }

  .video-title {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #1a1a1a;
    line-height: 1.4;
  }

  .video-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    font-size: 11px;
    color: #888;
  }

  .meta-icon {
    flex-shrink: 0;
  }

  .meta-sep {
    margin: 0 1px;
  }

  .badge {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 6px;
    background: var(--ytn-brand, #cc0000);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    border-radius: 12px;
    margin-left: 10px;
  }
</style>
