<script>
  import NoteItem from './NoteItem.svelte';
  import { msg, plural } from '../lib/i18n.js';

  let { notes, expanded = true, ondelete, onseek, onedit, maxLength = 0 } = $props();
</script>

{#if notes.length === 0}
  <p class="empty">{msg('notesList_empty')}</p>
{:else}
  {#if expanded}
    <div class="notes-list">
      {#each notes as note (note.id)}
        <NoteItem {note} {ondelete} {onseek} {onedit} {maxLength} />
      {/each}
    </div>
  {:else}
    <p class="collapsed-count">{plural('notesList_count', notes.length)}</p>
  {/if}
{/if}

<style>
  .notes-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0;
    margin: 8px 0 0 0;
  }

  .empty {
    color: var(--ytn-text-muted);
    font-size: 13px;
    margin: 8px 0;
  }

  .collapsed-count {
    color: var(--ytn-icon);
    font-size: 13px;
    margin: 4px 0;
  }
</style>
