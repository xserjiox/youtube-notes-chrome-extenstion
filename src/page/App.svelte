<script>
  import { getAllVideosWithNotes, getNotes, addNote, deleteNote, updateNoteText } from '../lib/storage.js';
  import VideoAccordion from '../components/VideoAccordion.svelte';

  let videos = $state([]);
  let videoNotes = $state({});
  let loading = $state(true);

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

  $effect(() => {
    function handleStorageChange() {
      loadAll().catch(err => console.error('[YT-Notes] Failed to reload data:', err));
    }
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  });

  loadAll().then(() => (loading = false)).catch(err => console.error('[YT-Notes] Failed to initialize:', err));
</script>

<main>
  <h1>YouTube Notes</h1>

  {#if loading}
    <p class="status">Loading...</p>
  {:else if videos.length === 0}
    <p class="status">No notes yet. Open a YouTube video and start adding notes!</p>
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
    background: #fafafa;
    --ytn-brand: #1565c0;
    --ytn-brand-hover: #0d47a1;
    --ytn-brand-light: #e3f2fd;
    --ytn-brand-light-hover: #bbdefb;
    --ytn-error: #e53935;
    --note-item-border: 1px solid #e8e8e8;
    --note-item-radius: 8px;
    --note-item-padding: 10px 12px;
    --note-item-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    --note-item-hover-bg: #f7f7f7;
    --note-item-hover-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    --note-ts-bg: #cc0000;
    --note-ts-size: 13px;
  }

  main {
    max-width: 960px;
    margin: 0 auto;
    padding: 32px 24px;
  }

  h1 {
    font-size: 24px;
    margin: 0 0 24px;
  }

  .status {
    color: #666;
  }
</style>
