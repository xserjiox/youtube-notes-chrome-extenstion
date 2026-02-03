<script>
  import { parseVideoId } from '../lib/utils.js';
  import {
    getNotes,
    addNote,
    deleteNote,
    updateNoteText,
    getAllVideosWithNotes,
    getVideoMeta,
    setVideoMeta,
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

  chrome.storage.onChanged.addListener(() => {
    if (view === 'list') {
      loadVideos().catch(err => console.error('[YT-Notes] Failed to reload videos:', err));
    } else if (selectedVideo) {
      getNotes(selectedVideo.videoId).then((n) => (notes = n)).catch(err => console.error('[YT-Notes] Failed to reload notes:', err));
    }
  });

  init();
</script>

<main>
  {#if loading}
    <p class="status">Loading...</p>
  {:else if view === 'list'}
    <div class="header">
      <h1>YouTube Notes</h1>
      <button class="link-btn" onclick={openFullPage}>Open full page</button>
    </div>

    {#if currentVideoId}
      <button class="current-video-btn" onclick={openCurrentVideo}>
        Current video notes &rarr;
      </button>
    {/if}

    <VideoList {videos} onselect={selectVideo} />
  {:else}
    <div class="header">
      <button class="back-btn" onclick={goBack}>&larr; Back</button>
      <h1 class="video-title">{selectedVideo?.title || selectedVideo?.videoId}</h1>
    </div>

    <NoteInput onsave={handleSave} />
    <NotesList {notes} expanded={true} ondelete={handleDelete} onseek={handleSeek} onedit={handleEdit} />
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
    --ytn-brand: #1565c0;
    --ytn-brand-hover: #0d47a1;
    --ytn-brand-light: #e3f2fd;
    --ytn-brand-light-hover: #bbdefb;
    --ytn-error: #e53935;
  }

  main {
    width: 360px;
    padding: 16px;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  h1 {
    font-size: 18px;
    margin: 0;
  }

  .video-title {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    flex: 1;
    margin-left: 8px;
  }

  .status {
    color: #666;
    margin: 0;
  }

  .link-btn {
    background: none;
    border: none;
    color: var(--ytn-brand);
    font-size: 12px;
    cursor: pointer;
    padding: 0;
    white-space: nowrap;
  }

  .link-btn:hover {
    text-decoration: underline;
  }

  .back-btn {
    background: none;
    border: none;
    color: var(--ytn-brand);
    font-size: 14px;
    cursor: pointer;
    padding: 0;
    white-space: nowrap;
  }

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
    text-align: left;
    font-family: inherit;
  }

  .current-video-btn:hover {
    background: var(--ytn-brand-light-hover);
  }
</style>
