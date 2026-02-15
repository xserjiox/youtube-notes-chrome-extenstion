<script>
  import { formatTimestamp } from '../lib/utils.js';
  import { msg } from '../lib/i18n.js';

  let { note, ondelete, onseek, onedit, maxLength = 0 } = $props();

  let editing = $state(false);
  let editText = $state('');
  let expanded = $state(false);

  let isTruncated = $derived(maxLength > 0 && note.text.length > maxLength);
  let displayText = $derived(isTruncated && !expanded ? note.text.slice(0, maxLength) + '...' : note.text);

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

<div class="note-item" class:editing>
  {#if editing}
    <div class="edit-card">
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
        <button class="save-btn" onclick={saveEdit}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          {msg('common_save')}
        </button>
        <button class="cancel-btn" onclick={cancelEdit}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          {msg('common_cancel')}
        </button>
      </div>
    </div>
  {:else}
    <div class="note-content">
      <span class="text">{displayText}{#if isTruncated}
        &nbsp;<button class="toggle-btn" onclick={() => expanded = !expanded}>{expanded ? msg('noteItem_showLess') : msg('noteItem_showMore')}</button>{/if}</span>
      <div class="note-footer">
        {#if note.timestamp != null}
          <button type="button" class="timestamp" onclick={() => onseek?.(note.timestamp)}>{formatTimestamp(note.timestamp)}</button>
        {/if}
        <div class="note-actions">
          <button class="edit-btn" onclick={(e) => { e.stopPropagation(); startEdit(); }} title={msg('noteItem_editTitle')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
              <path d="m15 5 4 4"/>
            </svg>
          </button>
          <button class="delete-btn" onclick={(e) => { e.stopPropagation(); ondelete(note.id); }} title={msg('noteItem_deleteTitle')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .note-item {
    padding: var(--note-item-padding, 14px 16px);
    border: var(--note-item-border, 1px solid #e0e0e0);
    border-radius: var(--note-item-radius, 10px);
    box-shadow: var(--note-item-shadow, none);
    transition: background 0.15s, box-shadow 0.15s;
  }

  .note-item.editing {
    border-color: transparent;
    padding: 0;
    box-shadow: none;
    background: none;
  }

  .note-item:not(.editing):hover {
    background: var(--note-item-hover-bg, #f5f5f5);
    box-shadow: var(--note-item-hover-shadow, none);
  }

  .note-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .note-footer {
    display: flex;
    align-items: center;
  }

  .note-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-inline-start: auto;
  }

  .edit-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    border: 1px solid #ddd;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }

  .timestamp {
    background: var(--note-ts-bg, #c62828);
    color: white;
    font-size: var(--note-ts-size, 11px);
    font-weight: 600;
    padding: var(--note-ts-padding, 3px 8px);
    border-radius: var(--note-ts-radius, 6px);
    border: none;
    font-family: monospace;
    line-height: 1;
    cursor: pointer;
  }

  .timestamp:hover {
    opacity: 0.85;
  }

  .text {
    font-size: 13px;
    color: #1a1a1a;
    line-height: 1.4;
    word-break: break-word;
  }

  .toggle-btn {
    background: none;
    border: none;
    padding: 0;
    color: #1a73e8;
    font-size: inherit;
    cursor: pointer;
    font-family: inherit;
    display: inline;
  }

  .toggle-btn:hover {
    text-decoration: underline;
  }

  .edit-textarea {
    width: 100%;
    min-height: 64px;
    font-size: 14px;
    font-family: inherit;
    padding: 12px 14px;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 10px;
    resize: vertical;
    box-sizing: border-box;
    color: #1a1a1a;
  }

  .edit-textarea:focus {
    outline: none;
    border-color: #aaa;
    background: #f0f0f0;
  }

  .edit-actions {
    display: flex;
    gap: 8px;
  }

  .save-btn,
  .cancel-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid transparent;
    cursor: pointer;
    font-family: inherit;
  }

  .save-btn {
    background: #1a1a1a;
    color: white;
    border-color: #1a1a1a;
  }

  .save-btn:hover {
    background: #333;
  }

  .cancel-btn {
    background: #fff;
    color: #555;
    border-color: #ddd;
  }

  .cancel-btn:hover {
    background: #f5f5f5;
  }

  .edit-btn,
  .delete-btn {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 6px;
    line-height: 1;
    border-radius: 50%;
    transition: background 0.15s, color 0.15s;
  }

  .edit-btn:hover {
    background: #e0e0e0;
    color: #555;
  }

  .delete-btn:hover {
    background: var(--ytn-error, #e53935);
    color: #fff;
  }
</style>
