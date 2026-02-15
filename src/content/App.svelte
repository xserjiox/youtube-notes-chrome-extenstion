<script>
  import { parseVideoId } from '../lib/utils.js';
  import { OPEN_NOTES_EVENT, CLOSE_NOTES_EVENT } from '../lib/constants.js';
  import { getNotes, addNote, deleteNote, updateNoteText, getVideoMeta, setVideoMeta } from '../lib/storage.js';
  import { msg } from '../lib/i18n.js';
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
  let lastKnownPosition = 0;

  // External (thumbnail) mode state
  let externalVideoId = $state(null);
  let externalTitle = $state(null);
  let externalMode = $derived(externalVideoId !== null);
  let effectiveVideoId = $derived(externalVideoId ?? videoId);

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
    return el?.textContent?.trim() || document.title.replace(' - YouTube', '').replace(/^\(\d+\)\s*/, '').trim();
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
    if (!effectiveVideoId) return;
    try {
      await addNote(effectiveVideoId, text, timestamp);

      if (externalMode) {
        const meta = await getVideoMeta(effectiveVideoId);
        await setVideoMeta(effectiveVideoId, {
          ...meta,
          title: externalTitle || effectiveVideoId,
          url: `https://www.youtube.com/watch?v=${effectiveVideoId}`,
        });
      } else {
        const meta = await getVideoMeta(effectiveVideoId);
        await setVideoMeta(effectiveVideoId, {
          ...meta,
          title: getVideoTitle(),
          url: location.href,
        });
      }

      // Reload notes for the effective video
      notes = await getNotes(effectiveVideoId);
      if (!externalMode) noteCount = notes.length;
    } catch (err) {
      console.error('[YT-Notes] Failed to save note:', err);
    }
  }

  function handleSeek(seconds) {
    const video = getVideoElement();
    if (video) video.currentTime = seconds;
  }

  async function handleDelete(noteId) {
    if (!effectiveVideoId) return;
    try {
      await deleteNote(effectiveVideoId, noteId);
      notes = await getNotes(effectiveVideoId);
      if (!externalMode) noteCount = notes.length;
    } catch (err) {
      console.error('[YT-Notes] Failed to delete note:', err);
    }
  }

  async function handleEdit(noteId, newText) {
    if (!effectiveVideoId) return;
    try {
      await updateNoteText(effectiveVideoId, noteId, newText);
      notes = await getNotes(effectiveVideoId);
    } catch (err) {
      console.error('[YT-Notes] Failed to edit note:', err);
    }
  }

  function handleClose() {
    open = false;
    externalVideoId = null;
    externalTitle = null;
    // Reload notes for the current page video (if on a watch page)
    if (videoId) loadNotes();
  }

  async function handleExternalOpen(e) {
    const { videoId: extId, title } = e.detail;
    externalVideoId = extId;
    externalTitle = title || extId;
    open = true;
    notes = await getNotes(extId);
    noteCount = notes.length;
  }

  function handleExternalClose() {
    if (externalMode) {
      handleClose();
    }
  }

  async function onNavigate() {
    try {
      const newId = detectVideoId();
      if (newId !== videoId) {
        videoId = newId;
        // Close popup on navigation
        if (open) handleClose();
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

    const handleNavigate = () => {
      onNavigate();
      trackVideo();
    };
    window.addEventListener('yt-navigate-finish', handleNavigate);

    const handleStorageChange = (changes) => {
      if (videoId && changes[`notes:${videoId}`]) {
        loadNotes().catch(err => console.error('[YT-Notes] Failed to reload notes:', err));
      }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);

    // Track video position via timeupdate event instead of polling
    function handleTimeUpdate(e) {
      if (!isAdPlaying()) {
        lastKnownPosition = Math.floor(e.target.currentTime);
      }
    }

    let trackedVideo = null;
    function trackVideo() {
      const video = getVideoElement();
      if (video === trackedVideo) return;
      trackedVideo?.removeEventListener('timeupdate', handleTimeUpdate);
      trackedVideo = video;
      video?.addEventListener('timeupdate', handleTimeUpdate);
    }

    trackVideo();
    // Retry in case video element loads asynchronously
    const videoRetry1 = setTimeout(trackVideo, 1000);
    const videoRetry2 = setTimeout(trackVideo, 3000);

    // Listen for external open/close events (from thumbnail buttons)
    window.addEventListener(OPEN_NOTES_EVENT, handleExternalOpen);
    window.addEventListener(CLOSE_NOTES_EVENT, handleExternalClose);

    // Initial load
    onNavigate();

    return () => {
      observer.disconnect();
      trackedVideo?.removeEventListener('timeupdate', handleTimeUpdate);
      clearTimeout(videoRetry1);
      clearTimeout(videoRetry2);
      window.removeEventListener('yt-navigate-finish', handleNavigate);
      chrome.storage.onChanged.removeListener(handleStorageChange);
      window.removeEventListener(OPEN_NOTES_EVENT, handleExternalOpen);
      window.removeEventListener(CLOSE_NOTES_EVENT, handleExternalClose);
    };
  });

  // Update duration and ad state while modal is open
  $effect(() => {
    if (open && !externalMode) {
      currentTimestamp = getVideoTimestamp();
      videoDuration = getVideoDuration();
      adPlaying = isAdPlaying();

      const video = getVideoElement();
      const player = getPlayerElement();

      // Listen for duration changes on the video element
      function handleDurationChange() {
        videoDuration = getVideoDuration();
      }

      // Observe player class changes for ad state
      let playerObserver = null;
      if (player) {
        playerObserver = new MutationObserver(() => {
          adPlaying = isAdPlaying();
        });
        playerObserver.observe(player, { attributes: true, attributeFilter: ['class'] });
      }

      if (video) {
        video.addEventListener('durationchange', handleDurationChange);
      }

      return () => {
        playerObserver?.disconnect();
        if (video) {
          video.removeEventListener('durationchange', handleDurationChange);
        }
      };
    }
  });
</script>

{#if videoId}
  <Trigger noteCount={noteCount} onclick={() => (open = !open)} />
{/if}

{#if open && effectiveVideoId}
  <Overlay onclose={handleClose} title={externalMode ? externalTitle : msg('common_videoNotes')}>
    <NoteInput
      onsave={handleSave}
      bind:timestamp={currentTimestamp}
      duration={videoDuration}
      {adPlaying}
      showTimestampToggle={!externalMode}
    />
    <NotesList {notes} expanded={true} ondelete={handleDelete} onseek={externalMode ? null : handleSeek} onedit={handleEdit} />
  </Overlay>
{/if}
