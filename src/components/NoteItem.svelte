<script>
  import { formatTimestamp } from '../lib/utils.js';

  let { note, ondelete, onseek, onedit } = $props();

  let editing = $state(false);
  let editText = $state('');

  function startEdit() {
    editText = note.text;
    editing = true;
  }

  function saveEdit() {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== note.text) {
      onedit?.(note.id, trimmed);
    }
    editing = false;
  }

  function cancelEdit() {
    editing = false;
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }
</script>

<div class="note-item">
  {#if editing}
    <div class="note-content editing">
      {#if note.timestamp != null}
        <span class="timestamp">{formatTimestamp(note.timestamp)}</span>
      {/if}
      <textarea
        class="edit-textarea"
        bind:value={editText}
        onkeydown={handleKeydown}
        onfocus={(e) => {
          const el = e.target;
          el.selectionStart = el.selectionEnd = el.value.length;
        }}
      ></textarea>
      <div class="edit-actions">
        <button class="save-btn" onclick={saveEdit}>Save</button>
        <button class="cancel-btn" onclick={cancelEdit}>Cancel</button>
      </div>
    </div>
  {:else}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="note-content" class:clickable={note.timestamp != null} onclick={() => note.timestamp != null && onseek?.(note.timestamp)}>
      {#if note.timestamp != null}
        <span class="timestamp">{formatTimestamp(note.timestamp)}</span>
      {/if}
      <span class="text">{note.text}</span>
    </div>
    <button class="edit-btn" onclick={startEdit} title="Edit note">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
        <path d="m15 5 4 4"/>
      </svg>
    </button>
    <button class="delete-btn" onclick={() => ondelete(note.id)} title="Delete note">
      &times;
    </button>
  {/if}
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

  .note-content.editing {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .timestamp {
    display: inline-block;
    background: var(--ytn-brand-light);
    color: var(--ytn-brand);
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

  .edit-textarea {
    width: 100%;
    min-height: 48px;
    font-size: 13px;
    font-family: inherit;
    padding: 6px 8px;
    border: 1px solid #bbb;
    border-radius: 4px;
    resize: vertical;
    box-sizing: border-box;
  }

  .edit-textarea:focus {
    outline: none;
    border-color: var(--ytn-brand);
  }

  .edit-actions {
    display: flex;
    gap: 6px;
  }

  .save-btn,
  .cancel-btn {
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 4px;
    border: 1px solid #ccc;
    cursor: pointer;
    font-family: inherit;
  }

  .save-btn {
    background: var(--ytn-brand);
    color: white;
    border-color: var(--ytn-brand);
  }

  .save-btn:hover {
    background: var(--ytn-brand-hover);
  }

  .cancel-btn {
    background: white;
    color: #555;
  }

  .cancel-btn:hover {
    background: #f5f5f5;
  }

  .edit-btn {
    flex-shrink: 0;
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 2px 4px;
    line-height: 1;
  }

  .edit-btn:hover {
    color: var(--ytn-brand);
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
    color: var(--ytn-error);
  }
</style>
