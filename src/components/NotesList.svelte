<script>
  import NoteItem from './NoteItem.svelte';

  let { notes, expanded = true, ondelete, onseek, onedit } = $props();
</script>

{#if notes.length === 0}
  <p class="empty">No notes yet.</p>
{:else}
  {#if expanded}
    <div class="notes-list">
      {#each notes as note (note.id)}
        <NoteItem {note} {ondelete} {onseek} {onedit} />
      {/each}
    </div>
  {:else}
    <p class="collapsed-count">{notes.length} note{notes.length === 1 ? '' : 's'}</p>
  {/if}
{/if}

<style>
  .notes-list {
    padding: 0;
    margin: 0;
  }

  .empty {
    color: #999;
    font-size: 13px;
    margin: 8px 0;
  }

  .collapsed-count {
    color: #666;
    font-size: 13px;
    margin: 4px 0;
  }
</style>
