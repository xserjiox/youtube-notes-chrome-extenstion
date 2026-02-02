<script>
  import { formatTimestamp } from '../lib/utils.js';

  let { note, ondelete, onseek } = $props();
</script>

<div class="note-item">
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="note-content" class:clickable={note.timestamp != null} onclick={() => note.timestamp != null && onseek?.(note.timestamp)}>
    {#if note.timestamp != null}
      <span class="timestamp">{formatTimestamp(note.timestamp)}</span>
    {/if}
    <span class="text">{note.text}</span>
  </div>
  <button class="delete-btn" onclick={() => ondelete(note.id)} title="Delete note">
    &times;
  </button>
</div>

<style>
  .note-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
  }

  .note-content {
    flex: 1;
    min-width: 0;
    word-break: break-word;
    padding: 4px 6px;
    border-radius: 4px;
  }

  .note-content.clickable {
    cursor: pointer;
  }

  .note-content.clickable:hover {
    background: #f5f5f5;
  }

  .timestamp {
    display: inline-block;
    background: #e3f2fd;
    color: #1565c0;
    font-size: 11px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 4px;
    margin-right: 6px;
    font-family: monospace;
  }

  .text {
    font-size: 13px;
    color: #1a1a1a;
  }

  .delete-btn {
    flex-shrink: 0;
    background: none;
    border: none;
    color: #999;
    font-size: 18px;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
  }

  .delete-btn:hover {
    color: #e53935;
  }
</style>
