<script>
  import { parseVideoId } from '../lib/utils.js';
  import {
    getNotes,
    addNote,
    deleteNote,
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
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return null;
    return parseVideoId(tab.url);
  }

  async function loadVideos() {
    videos = await getAllVideosWithNotes();
  }

  async function selectVideo(video) {
    selectedVideo = video;
    notes = await getNotes(video.videoId);
    view = 'notes';
  }

  async function handleSave(text) {
    if (!selectedVideo) return;
    await addNote(selectedVideo.videoId, text, null);
    notes = await getNotes(selectedVideo.videoId);
    await loadVideos();
  }

  async function handleDelete(noteId) {
    if (!selectedVideo) return;
    await deleteNote(selectedVideo.videoId, noteId);
    notes = await getNotes(selectedVideo.videoId);
    if (notes.length === 0) {
      goBack();
    } else {
      await loadVideos();
    }
  }

  function goBack() {
    view = 'list';
    selectedVideo = null;
    notes = [];
    loadVideos();
  }

  async function openCurrentVideo() {
    if (!currentVideoId) return;
    const meta = await getVideoMeta(currentVideoId);
    await selectVideo(meta);
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
    currentVideoId = await getCurrentTabVideoId();
    await loadVideos();
    loading = false;
  }

  chrome.storage.onChanged.addListener(() => {
    if (view === 'list') {
      loadVideos();
    } else if (selectedVideo) {
      getNotes(selectedVideo.videoId).then((n) => (notes = n));
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
    <NotesList {notes} expanded={true} ondelete={handleDelete} onseek={handleSeek} />
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
    color: #1565c0;
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
    color: #1565c0;
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
    background: #e3f2fd;
    color: #1565c0;
    border: 1px solid #bbdefb;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    text-align: left;
    font-family: inherit;
  }

  .current-video-btn:hover {
    background: #bbdefb;
  }
</style>
