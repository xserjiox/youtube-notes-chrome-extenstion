<script>
  import { getAllVideosWithNotes, getNotes, addNote, deleteNote, updateNoteText } from '../lib/storage.js';
  import NotesList from '../components/NotesList.svelte';
  import NoteInput from '../components/NoteInput.svelte';

  let videos = $state([]);
  let videoNotes = $state({});
  let loading = $state(true);

  async function loadAll() {
    videos = await getAllVideosWithNotes();
    const notesMap = {};
    for (const v of videos) {
      notesMap[v.videoId] = await getNotes(v.videoId);
    }
    videoNotes = notesMap;
  }

  async function handleSave(videoId, text) {
    await addNote(videoId, text, null);
    await loadAll();
  }

  async function handleDelete(videoId, noteId) {
    await deleteNote(videoId, noteId);
    await loadAll();
  }

  async function handleEdit(videoId, noteId, newText) {
    await updateNoteText(videoId, noteId, newText);
    await loadAll();
  }

  chrome.storage.onChanged.addListener(() => {
    loadAll();
  });

  loadAll().then(() => (loading = false));
</script>

<main>
  <h1>YouTube Notes</h1>

  {#if loading}
    <p class="status">Loading...</p>
  {:else if videos.length === 0}
    <p class="status">No notes yet. Open a YouTube video and start adding notes!</p>
  {:else}
    {#each videos as video (video.videoId)}
      <section class="video-section">
        <div class="video-header">
          <h2>
            {#if video.url}
              <a href={video.url} target="_blank" rel="noopener">{video.title || video.videoId}</a>
            {:else}
              {video.title || video.videoId}
            {/if}
          </h2>
          <span class="note-count"
            >{video.noteCount} note{video.noteCount === 1 ? '' : 's'}</span
          >
        </div>

        <NoteInput onsave={(text) => handleSave(video.videoId, text)} />
        <NotesList
          notes={videoNotes[video.videoId] || []}
          expanded={true}
          ondelete={(noteId) => handleDelete(video.videoId, noteId)}
          onedit={(noteId, newText) => handleEdit(video.videoId, noteId, newText)}
          onseek={(seconds) => {
            if (!video.url) return;
            const url = new URL(video.url);
            url.searchParams.set('t', `${Math.floor(seconds)}s`);
            window.open(url.toString(), '_blank');
          }}
        />
      </section>
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
  }

  main {
    max-width: 720px;
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

  .video-section {
    background: white;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .video-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .video-header h2 {
    margin: 0;
    font-size: 16px;
  }

  .video-header a {
    color: #1565c0;
    text-decoration: none;
  }

  .video-header a:hover {
    text-decoration: underline;
  }

  .note-count {
    font-size: 12px;
    color: #888;
    white-space: nowrap;
  }
</style>
