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

  const POSITION_POLL_MS = 1000;

  function getVideoElement() {
    return document.querySelector('video');
  }

  function getPlayerElement() {
    return document.querySelector('#movie_player');
  }

  function detectVideoId() {
    return parseVideoId(location.href);
  }

  function isAdPlaying() {
    return getPlayerElement()?.classList.contains('ad-showing') ?? false;
  }

  function getVideoTimestamp() {
    const video = getVideoElement();
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
    try {
      notes = await getNotes(videoId);
      noteCount = notes.length;
    } catch (err) {
      console.error('[YT-Notes] Failed to load notes:', err);
      notes = [];
      noteCount = 0;
    }
  }

  async function handleSave(text, timestamp) {
    if (!videoId) return;
    try {
      await addNote(videoId, text, timestamp);

      // Save or update video meta
      const meta = await getVideoMeta(videoId);
      await setVideoMeta(videoId, {
        ...meta,
        title: getVideoTitle(),
        url: location.href,
      });

      await loadNotes();
    } catch (err) {
      console.error('[YT-Notes] Failed to save note:', err);
    }
  }

  function handleSeek(seconds) {
    const video = getVideoElement();
    if (video) video.currentTime = seconds;
  }

  async function handleDelete(noteId) {
    if (!videoId) return;
    try {
      await deleteNote(videoId, noteId);
      await loadNotes();
    } catch (err) {
      console.error('[YT-Notes] Failed to delete note:', err);
    }
  }

  async function handleEdit(noteId, newText) {
    if (!videoId) return;
    try {
      await updateNoteText(videoId, noteId, newText);
      await loadNotes();
    } catch (err) {
      console.error('[YT-Notes] Failed to edit note:', err);
    }
  }

  async function onNavigate() {
    try {
      const newId = detectVideoId();
      if (newId !== videoId) {
        videoId = newId;
        await loadNotes();
      }
    } catch (err) {
      console.error('[YT-Notes] Failed to handle navigation:', err);
    }
  }

  function getVideoDuration() {
    const video = getVideoElement();
    if (!video || !video.duration || !isFinite(video.duration)) return null;
    return Math.floor(video.duration);
  }

  // Side-effects with cleanup
  $effect(() => {
    const observer = new MutationObserver(() => onNavigate());
    observer.observe(document.querySelector('title') || document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    const handleNavigate = () => onNavigate();
    window.addEventListener('yt-navigate-finish', handleNavigate);

    const handleStorageChange = (changes) => {
      if (videoId && changes[`notes:${videoId}`]) {
        loadNotes().catch(err => console.error('[YT-Notes] Failed to reload notes:', err));
      }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);

    const positionInterval = setInterval(() => {
      if (videoId && !isAdPlaying()) {
        const video = getVideoElement();
        if (video) lastKnownPosition = Math.floor(video.currentTime);
      }
    }, POSITION_POLL_MS);

    // Initial load
    onNavigate();

    return () => {
      observer.disconnect();
      window.removeEventListener('yt-navigate-finish', handleNavigate);
      chrome.storage.onChanged.removeListener(handleStorageChange);
      clearInterval(positionInterval);
    };
  });

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
