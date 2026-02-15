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
  import { msg, isRTL } from '../lib/i18n.js';
  import { currentTheme, setTheme, onThemeChange } from '../lib/theme.js';
  import VideoList from '../components/VideoList.svelte';
  import NotesList from '../components/NotesList.svelte';
  import NoteInput from '../components/NoteInput.svelte';

  let view = $state('list'); // 'list' | 'notes'
  let videos = $state([]);
  let selectedVideo = $state(null);
  let notes = $state([]);
  let loading = $state(true);
  let currentVideoId = $state(null);
  let dir = $derived(isRTL() ? 'rtl' : 'ltr');
  let theme = $state(currentTheme());

  $effect(() => {
    return onThemeChange((t) => {
      theme = t;
    });
  });

  function cycleTheme() {
    const order = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  }

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

<main {dir}>
  {#if loading}
    <p class="status">{msg('common_loading')}</p>
  {:else if view === 'list'}
    <div class="header-banner">
      <div class="header-banner-content">
        <div>
          <h1>{msg('common_youtubeNotes')}</h1>
          <p class="subtitle">{msg('popup_subtitle')}</p>
        </div>
        <div class="header-actions">
          <button class="theme-btn" onclick={cycleTheme} title={msg('theme_label')}>
            {#if theme === 'light'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            {:else if theme === 'dark'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            {:else}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            {/if}
          </button>
          <button class="expand-btn" onclick={openFullPage} title={msg('popup_openFullPage')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h6v6"/>
              <path d="M10 14L21 3"/>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="body-content">
      {#if currentVideoId}
        <button class="current-video-btn" onclick={openCurrentVideo}>
          {msg('popup_currentVideoNotes')} &rarr;
        </button>
      {/if}

      <VideoList {videos} onselect={selectVideo} />
    </div>
  {:else}
    <div class="notes-view">
      <button class="back-btn" onclick={goBack}>&larr; {msg('popup_back')}</button>
      <h2 class="video-title">{selectedVideo?.title || selectedVideo?.videoId}</h2>
      {#if selectedVideo?.url}
        <a class="open-youtube-link" href={selectedVideo.url} onclick={(e) => { e.preventDefault(); openOnYouTube(); }}>
          {msg('common_openOnYouTube')}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      {/if}

      <div class="notes-content">
        <NoteInput onsave={handleSave} />
        <NotesList {notes} expanded={true} ondelete={handleDelete} onseek={handleSeek} onedit={handleEdit} maxLength={200} />
      </div>
    </div>
  {/if}
</main>

<style>
  :global(:root) {
    --ytn-brand: #cc0000;
    --ytn-brand-hover: #a30000;
    --ytn-brand-light: #fce4e4;
    --ytn-brand-light-hover: #f5c6c6;
    --ytn-error: #e53935;
    --ytn-bg: #fafafa;
    --ytn-surface: #fff;
    --ytn-surface-hover: #f5f5f5;
    --ytn-input-bg: #f5f5f5;
    --ytn-input-bg-focus: #f0f0f0;
    --ytn-text: #1a1a1a;
    --ytn-text-secondary: #555;
    --ytn-text-muted: #999;
    --ytn-border: #ddd;
    --ytn-border-light: #eee;
    --ytn-link: #1a73e8;
    --ytn-icon: #666;
    --ytn-icon-muted: #999;
    --ytn-btn-primary-bg: #333;
    --ytn-btn-primary-text: #fff;
    --ytn-btn-primary-hover: #444;
    --ytn-shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
    --ytn-shadow-md: 0 1px 4px rgba(0,0,0,0.08);
    --ytn-shadow-lg: 0 8px 32px rgba(0,0,0,0.2);
    --ytn-backdrop: rgba(0,0,0,0.5);
  }

  :global(:root[data-theme="dark"]) {
    --ytn-brand-light: #3d2020;
    --ytn-brand-light-hover: #4d2a2a;
    --ytn-bg: #181818;
    --ytn-surface: #282828;
    --ytn-surface-hover: #333;
    --ytn-input-bg: #333;
    --ytn-input-bg-focus: #3a3a3a;
    --ytn-text: #e0e0e0;
    --ytn-text-secondary: #aaa;
    --ytn-text-muted: #666;
    --ytn-border: #444;
    --ytn-border-light: #333;
    --ytn-link: #6eb5ff;
    --ytn-icon: #999;
    --ytn-icon-muted: #666;
    --ytn-btn-primary-bg: #e0e0e0;
    --ytn-btn-primary-text: #1a1a1a;
    --ytn-btn-primary-hover: #ccc;
    --ytn-shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
    --ytn-shadow-md: 0 1px 4px rgba(0,0,0,0.4);
    --ytn-shadow-lg: 0 8px 32px rgba(0,0,0,0.5);
    --ytn-backdrop: rgba(0,0,0,0.7);
  }

  :global(body) {
    margin: 0;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
    font-size: 14px;
    color: var(--ytn-text);
    background: var(--ytn-bg);
  }

  main {
    width: 360px;
  }

  .status {
    color: var(--ytn-icon);
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

  .header-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .theme-btn {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 4px;
    opacity: 0.85;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .theme-btn:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.15);
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
    text-align: start;
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
    background: var(--ytn-surface);
    border: 1px solid var(--ytn-border);
    color: var(--ytn-text-secondary);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    padding: 6px 14px;
    margin-bottom: 12px;
    font-family: inherit;
    border-radius: 8px;
  }

  .back-btn:hover {
    background: var(--ytn-surface-hover);
  }

  .video-title {
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 4px;
    line-height: 1.3;
    color: var(--ytn-text);
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
