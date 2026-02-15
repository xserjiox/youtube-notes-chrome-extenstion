<script>
  import { getAllVideosWithNotes, getNotes, addNote, deleteNote, updateNoteText } from '../lib/storage.js';
  import { msg, currentLocale, setLocale, onLocaleChange, isRTL } from '../lib/i18n.js';
  import { currentTheme, setTheme, onThemeChange } from '../lib/theme.js';
  import { LOCALE_LABELS } from '../lib/locales/index.js';
  import VideoAccordion from '../components/VideoAccordion.svelte';

  const THEME_OPTIONS = [
    { value: 'light', key: 'theme_light' },
    { value: 'dark', key: 'theme_dark' },
    { value: 'system', key: 'theme_system' },
  ];

  let videos = $state([]);
  let videoNotes = $state({});
  let loading = $state(true);
  let locale = $state(currentLocale());
  let dir = $state(isRTL() ? 'rtl' : 'ltr');
  let theme = $state(currentTheme());

  $effect(() => {
    return onLocaleChange((code) => {
      locale = code;
      dir = isRTL() ? 'rtl' : 'ltr';
    });
  });

  $effect(() => {
    return onThemeChange((t) => {
      theme = t;
    });
  });

  async function loadAll() {
    try {
      videos = await getAllVideosWithNotes();
      const entries = await Promise.all(
        videos.map(async (v) => [v.videoId, await getNotes(v.videoId)]),
      );
      videoNotes = Object.fromEntries(entries);
    } catch (err) {
      console.error('[YT-Notes] Failed to load all data:', err);
      videos = [];
      videoNotes = {};
    }
  }

  async function handleAddNote(videoId, text) {
    try {
      await addNote(videoId, text, null);
      await loadAll();
    } catch (err) {
      console.error('[YT-Notes] Failed to save note:', err);
    }
  }

  async function handleDelete(videoId, noteId) {
    try {
      await deleteNote(videoId, noteId);
      await loadAll();
    } catch (err) {
      console.error('[YT-Notes] Failed to delete note:', err);
    }
  }

  async function handleEdit(videoId, noteId, newText) {
    try {
      await updateNoteText(videoId, noteId, newText);
      await loadAll();
    } catch (err) {
      console.error('[YT-Notes] Failed to edit note:', err);
    }
  }

  function handleSeek(videoId, seconds) {
    const video = videos.find(v => v.videoId === videoId);
    if (!video?.url) return;
    const url = new URL(video.url);
    url.searchParams.set('t', `${Math.floor(seconds)}s`);
    window.open(url.toString(), '_blank');
  }

  function handleLocaleChange(e) {
    setLocale(e.target.value);
  }

  function handleThemeChange(e) {
    setTheme(e.target.value);
  }

  $effect(() => {
    function handleStorageChange() {
      loadAll().catch(err => console.error('[YT-Notes] Failed to reload data:', err));
    }
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  });

  loadAll().then(() => (loading = false)).catch(err => console.error('[YT-Notes] Failed to initialize:', err));
</script>

<main {dir}>
  <div class="header">
    <h1>{msg('common_youtubeNotes')}</h1>
    <div class="header-controls">
      <div class="select-wrapper">
        <select class="theme-select" value={theme} onchange={handleThemeChange} autocomplete="off">
          {#each THEME_OPTIONS as opt (opt.value)}
            <option value={opt.value} selected={opt.value === theme}>{msg(opt.key)}</option>
          {/each}
        </select>
      </div>
      <div class="select-wrapper">
        <select id="locale-select" class="locale-select" value={locale} onchange={handleLocaleChange} autocomplete="off">
          {#each Object.entries(LOCALE_LABELS) as [code, label] (code)}
            <option value={code} selected={code === locale}>{label}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  {#key locale}
    {#if loading}
      <p class="status">{msg('common_loading')}</p>
    {:else if videos.length === 0}
      <p class="status">{msg('page_emptyState')}</p>
    {:else}
      {#each videos as video (video.videoId)}
        <VideoAccordion
          {video}
          notes={videoNotes[video.videoId] || []}
          onaddnote={handleAddNote}
          ondeletenote={handleDelete}
          oneditnote={handleEdit}
          onseek={handleSeek}
        />
      {/each}
    {/if}
  {/key}
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
    --note-item-border: 1px solid #e8e8e8;
    --note-item-radius: 8px;
    --note-item-padding: 10px 12px;
    --note-item-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    --note-item-hover-bg: #f7f7f7;
    --note-item-hover-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    --note-ts-bg: #cc0000;
    --note-ts-size: 13px;
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
    --note-item-border: 1px solid #444;
    --note-item-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    --note-item-hover-bg: #333;
    --note-item-hover-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
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
    max-width: 960px;
    margin: 0 auto;
    padding: 32px 24px;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  h1 {
    font-size: 24px;
    margin: 0;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .select-wrapper {
    position: relative;
    display: inline-block;
  }

  .select-wrapper::after {
    content: '';
    position: absolute;
    top: 55%;
    inset-inline-end: 10px;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid var(--ytn-icon);
    pointer-events: none;
  }

  .theme-select,
  .locale-select {
    appearance: none;
    padding: 6px 10px;
    padding-inline-end: 28px;
    border: 1px solid var(--ytn-border);
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
    background: var(--ytn-surface);
    color: var(--ytn-text);
    cursor: pointer;
  }

  .theme-select:hover,
  .locale-select:hover {
    border-color: var(--ytn-text-muted);
  }

  .status {
    color: var(--ytn-icon);
  }
</style>
