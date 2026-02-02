<script>
  import { parseVideoId } from '../lib/utils.js';
  import { getNotes, addNote, deleteNote, updateNoteText, getVideoMeta, setVideoMeta } from '../lib/storage.js';
  import Trigger from './Trigger.svelte';
  import Overlay from './Overlay.svelte';
  import NotesList from '../components/NotesList.svelte';
  import NoteInput from '../components/NoteInput.svelte';

  let open = $state(false);
  let videoId = $state(null);
  let notes = $state([]);
  let noteCount = $state(0);
  let currentTimestamp = $state(null);
  let videoDuration = $state(null);
  let adPlaying = $state(false);
  let lastKnownPosition = null;

  function detectVideoId() {
    return parseVideoId(location.href);
  }

  function isAdPlaying() {
    return document.querySelector('#movie_player')?.classList.contains('ad-showing') ?? false;
  }

  function getVideoTimestamp() {
    const video = document.querySelector('video');
    if (!video) return 0;
    if (isAdPlaying()) return lastKnownPosition ?? 0;
    lastKnownPosition = Math.floor(video.currentTime);
    return lastKnownPosition;
  }

  function getVideoTitle() {
    const el =
      document.querySelector('h1.ytd-watch-metadata yt-formatted-string') ||
      document.querySelector('h1.ytd-video-primary-info-renderer');
    return el?.textContent?.trim() || document.title.replace(' - YouTube', '').trim();
  }

  async function loadNotes() {
    if (!videoId) {
      notes = [];
      noteCount = 0;
      return;
    }
    notes = await getNotes(videoId);
    noteCount = notes.length;
  }

  async function handleSave(text, timestamp) {
    if (!videoId) return;
    await addNote(videoId, text, timestamp);

    // Save or update video meta
    const meta = await getVideoMeta(videoId);
    await setVideoMeta(videoId, {
      ...meta,
      title: getVideoTitle(),
      url: location.href,
    });

    await loadNotes();
  }

  function handleSeek(seconds) {
    const video = document.querySelector('video');
    if (video) video.currentTime = seconds;
  }

  async function handleDelete(noteId) {
    if (!videoId) return;
    await deleteNote(videoId, noteId);
    await loadNotes();
  }

  async function handleEdit(noteId, newText) {
    if (!videoId) return;
    await updateNoteText(videoId, noteId, newText);
    await loadNotes();
  }

  async function onNavigate() {
    const newId = detectVideoId();
    if (newId !== videoId) {
      videoId = newId;
      await loadNotes();
    }
  }

  // Track YouTube SPA navigation
  const observer = new MutationObserver(() => onNavigate());
  observer.observe(document.querySelector('title') || document.head, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // Also listen to popstate / yt-navigate-finish
  window.addEventListener('yt-navigate-finish', () => onNavigate());

  // Listen for storage changes from other contexts
  chrome.storage.onChanged.addListener((changes) => {
    if (videoId && changes[`notes:${videoId}`]) {
      loadNotes();
    }
  });

  // Initial load
  onNavigate();

  // Track video position in background so it's available during ads
  setInterval(() => {
    if (videoId && !isAdPlaying()) {
      const video = document.querySelector('video');
      if (video) lastKnownPosition = Math.floor(video.currentTime);
    }
  }, 1000);

  function getVideoDuration() {
    const video = document.querySelector('video');
    if (!video || !video.duration || !isFinite(video.duration)) return null;
    return Math.floor(video.duration);
  }

  // Set timestamp on modal open; update duration while open
  $effect(() => {
    if (open) {
      currentTimestamp = getVideoTimestamp();
      videoDuration = getVideoDuration();
      adPlaying = isAdPlaying();
      const interval = setInterval(() => {
        videoDuration = getVideoDuration();
        adPlaying = isAdPlaying();
      }, 1000);
      return () => clearInterval(interval);
    }
  });
</script>

{#if videoId}
  <Trigger noteCount={noteCount} onclick={() => (open = !open)} />
{/if}

{#if open && videoId}
  <Overlay onclose={() => (open = false)}>
    <NoteInput
      onsave={handleSave}
      bind:timestamp={currentTimestamp}
      duration={videoDuration}
      {adPlaying}
      showTimestampToggle={true}
    />
    <NotesList {notes} expanded={true} ondelete={handleDelete} onseek={handleSeek} onedit={handleEdit} />
  </Overlay>
{/if}
