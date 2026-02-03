<script>
  import { parseVideoId } from '../lib/utils.js';
  import {
    getNotes,
    addNote,
    deleteNote,
    updateNoteText,
    getAllVideosWithNotes,
    getVideoMeta,
  } from '../lib/storage.js';
  import VideoList from '../components/VideoList.svelte';
  import NotesList from '../components/NotesList.svelte';
  import NoteInput from '../components/NoteInput.svelte';

  let view = $state('list'); // 'list' | 'notes'
  let videos = $state([]);
  let selectedVideo = $state(null);
  let notes = $state([]);
  let loading = $state(true);
  let currentVideoId = $state(null);

  async function getCurrentTabVideoId() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) return null;
      return parseVideoId(tab.url);
    } catch (err) {
      console.error('[YT-Notes] Failed to get current tab video ID:', err);
      return null;
    }
  }

  async function loadVideos() {
    try {
      videos = await getAllVideosWithNotes();
    } catch (err) {
      console.error('[YT-Notes] Failed to load videos:', err);
      videos = [];
    }
  }

  async function selectVideo(video) {
    try {
      selectedVideo = video;
      notes = await getNotes(video.videoId);
      view = 'notes';
    } catch (err) {
      console.error('[YT-Notes] Failed to select video:', err);
    }
  }

  async function handleSave(text) {
    if (!selectedVideo) return;
    try {
      await addNote(selectedVideo.videoId, text, null);
      notes = await getNotes(selectedVideo.videoId);
      await loadVideos();
    } catch (err) {
      console.error('[YT-Notes] Failed to save note:', err);
    }
  }

  async function handleDelete(noteId) {
    if (!selectedVideo) return;
    try {
      await deleteNote(selectedVideo.videoId, noteId);
      notes = await getNotes(selectedVideo.videoId);
      if (notes.length === 0) {
        goBack();
      } else {
        await loadVideos();
      }
    } catch (err) {
      console.error('[YT-Notes] Failed to delete note:', err);
    }
  }

  async function handleEdit(noteId, newText) {
    if (!selectedVideo) return;
    try {
      await updateNoteText(selectedVideo.videoId, noteId, newText);
      notes = await getNotes(selectedVideo.videoId);
    } catch (err) {
      console.error('[YT-Notes] Failed to edit note:', err);
    }
  }

  function goBack() {
    view = 'list';
    selectedVideo = null;
    notes = [];
    loadVideos().catch(err => console.error('[YT-Notes] Failed to reload videos:', err));
  }

  async function openCurrentVideo() {
    if (!currentVideoId) return;
    try {
      const meta = await getVideoMeta(currentVideoId);

      // Bug fix: fallback to tab title/url if meta has no title
      if (!meta.title || !meta.url) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          if (!meta.title && tab.title) {
            // Clean YouTube suffix from tab title
            meta.title = tab.title.replace(/\s*-\s*YouTube\s*$/, '');
          }
          if (!meta.url && tab.url) {
            meta.url = tab.url;
          }
        }
      }

      await selectVideo(meta);
    } catch (err) {
      console.error('[YT-Notes] Failed to open current video:', err);
    }
  }

  function handleSeek(seconds) {
    if (!selectedVideo?.url) return;
    const url = new URL(selectedVideo.url);
    url.searchParams.set('t', `${Math.floor(seconds)}s`);
    chrome.tabs.create({ url: url.toString() });
  }

  function openFullPage() {
    chrome.tabs.create({ url: chrome.runtime.getURL('page.html') });
  }

  function openOnYouTube() {
    if (!selectedVideo?.url) return;
    chrome.tabs.create({ url: selectedVideo.url });
  }

  async function init() {
    try {
      currentVideoId = await getCurrentTabVideoId();
      await loadVideos();
    } catch (err) {
      console.error('[YT-Notes] Failed to initialize popup:', err);
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    function handleStorageChange() {
      if (view === 'list') {
        loadVideos().catch(err => console.error('[YT-Notes] Failed to reload videos:', err));
      } else if (selectedVideo) {
        getNotes(selectedVideo.videoId).then((n) => (notes = n)).catch(err => console.error('[YT-Notes] Failed to reload notes:', err));
      }
    }
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  });

  init();
</script>

<main>
  {#if loading}
    <p class="status">Loading...</p>
  {:else if view === 'list'}
    <div class="header-banner">
      <div class="header-banner-content">
        <div>
          <h1>YouTube Notes</h1>
          <p class="subtitle">Your video notes collection</p>
        </div>
        <button class="expand-btn" onclick={openFullPage} title="Open full page">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h6v6"/>
            <path d="M10 14L21 3"/>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="body-content">
      {#if currentVideoId}
        <button class="current-video-btn" onclick={openCurrentVideo}>
          Current video notes &rarr;
        </button>
      {/if}

      <VideoList {videos} onselect={selectVideo} />
    </div>
  {:else}
    <div class="notes-view">
      <button class="back-btn" onclick={goBack}>&larr; Back</button>
      <h2 class="video-title">{selectedVideo?.title || selectedVideo?.videoId}</h2>
      {#if selectedVideo?.url}
        <a class="open-youtube-link" href={selectedVideo.url} onclick={(e) => { e.preventDefault(); openOnYouTube(); }}>
          Open on YouTube
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      {/if}

      <div class="notes-content">
        <NoteInput onsave={handleSave} />
        <NotesList {notes} expanded={true} ondelete={handleDelete} onseek={handleSeek} onedit={handleEdit} />
      </div>
    </div>
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
    font-size: 14px;
    color: #1a1a1a;
    --ytn-brand: #cc0000;
    --ytn-brand-hover: #a30000;
    --ytn-brand-light: #fce4e4;
    --ytn-brand-light-hover: #f5c6c6;
    --ytn-error: #e53935;
  }

  main {
    width: 360px;
  }

  .status {
    color: #666;
    margin: 0;
    padding: 16px;
  }

  /* === List View: Red Banner Header === */
  .header-banner {
    background: var(--ytn-brand);
    color: #fff;
    padding: 16px;
  }

  .header-banner-content {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  .header-banner h1 {
    font-size: 18px;
    margin: 0;
    font-weight: 700;
  }

  .subtitle {
    margin: 4px 0 0;
    font-size: 12px;
    opacity: 0.85;
  }

  .expand-btn {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 4px;
    opacity: 0.85;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .expand-btn:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.15);
  }

  .body-content {
    padding: 12px 16px 16px;
  }

  /* === Current Video Button === */
  .current-video-btn {
    display: block;
    width: 100%;
    padding: 10px;
    margin-bottom: 12px;
    background: var(--ytn-brand-light);
    color: var(--ytn-brand);
    border: 1px solid var(--ytn-brand-light-hover);
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    text-align: left;
    font-family: inherit;
  }

  .current-video-btn:hover {
    background: var(--ytn-brand-light-hover);
  }

  /* === Notes Detail View === */
  .notes-view {
    padding: 16px;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #fff;
    border: 1px solid #ddd;
    color: #555;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    padding: 6px 14px;
    margin-bottom: 12px;
    font-family: inherit;
    border-radius: 8px;
  }

  .back-btn:hover {
    background: #f5f5f5;
  }

  .video-title {
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 4px;
    line-height: 1.3;
    color: #1a1a1a;
  }

  .open-youtube-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--ytn-brand);
    text-decoration: none;
    margin-bottom: 12px;
  }

  .open-youtube-link:hover {
    text-decoration: underline;
  }

  .notes-content {
    margin-top: 4px;
  }

</style>
