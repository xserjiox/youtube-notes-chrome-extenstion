<script>
  import { formatTimestamp, parseTimestamp } from '../lib/utils.js';

  let { onsave, timestamp = $bindable(null), duration = null, adPlaying = false, showTimestampToggle = false } = $props();

  let text = $state('');
  let useTimestamp = $state(true);
  let editingTimestamp = $state(false);
  let tsInputText = $state('');
  let tsInputEl = $state(null);
  let tsError = $state(false);

  function handleSave() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onsave(trimmed, showTimestampToggle && useTimestamp ? timestamp : null);
    text = '';
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  }

  function startTsEdit() {
    if (adPlaying) return;
    tsInputText = formatTimestamp(timestamp) ?? '0:00';
    tsError = false;
    editingTimestamp = true;
    queueMicrotask(() => {
      tsInputEl?.focus();
      tsInputEl?.select();
    });
  }

  function confirmTs() {
    const parsed = parseTimestamp(tsInputText.trim());
    if (parsed == null) {
      tsError = true;
      return;
    }
    let v = parsed;
    if (v < 0) v = 0;
    if (duration != null && v > duration) v = duration;
    timestamp = v;
    editingTimestamp = false;
    tsError = false;
  }

  function cancelTs() {
    editingTimestamp = false;
    tsError = false;
  }

  function handleTsKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmTs();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelTs();
    }
  }
</script>

<div class="note-input">
  <textarea
    bind:value={text}
    placeholder="Write your note here..."
    rows="3"
    onkeydown={handleKeydown}
  ></textarea>

  <div class="actions-row">
    {#if showTimestampToggle}
      <div class="timestamp-section">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="toggle-track" class:active={useTimestamp} onclick={() => (useTimestamp = !useTimestamp)}>
          <div class="toggle-thumb"></div>
        </div>
        <svg class="clock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="timestamp-label">
          Add timestamp
          {#if useTimestamp && timestamp != null}
            {#if editingTimestamp}
              (<input
                bind:this={tsInputEl}
                bind:value={tsInputText}
                class="ts-inline-input"
                class:invalid={tsError}
                style="width: {(tsInputText.length || 4)}ch"
                placeholder="0:00"
                onkeydown={handleTsKeydown}
                onblur={confirmTs}
              />)
            {:else}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <span class="timestamp-time" onclick={startTsEdit}>({formatTimestamp(timestamp)})</span>
            {/if}
          {/if}
        </span>
      </div>
    {/if}

    <button class="save-btn" onclick={handleSave} disabled={!text.trim()}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
      Save Note
    </button>
  </div>
</div>

<style>
  .note-input {
    margin-top: 8px;
  }

  textarea {
    width: 100%;
    box-sizing: border-box;
    border: none;
    border-radius: 8px;
    padding: 14px 16px;
    font-family: inherit;
    font-size: 14px;
    resize: vertical;
    min-height: 60px;
    outline: none;
    background: #f5f5f5;
    color: #1a1a1a;
  }

  textarea::placeholder {
    color: #999;
  }

  textarea:focus {
    background: #f0f0f0;
  }

  .actions-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
  }

  .timestamp-section {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .toggle-track {
    width: 36px;
    height: 20px;
    border-radius: 10px;
    background: #ccc;
    position: relative;
    cursor: pointer;
    transition: background 0.2s;
    flex-shrink: 0;
  }

  .toggle-track.active {
    background: #1a1a1a;
  }

  .toggle-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.2s;
  }

  .toggle-track.active .toggle-thumb {
    transform: translateX(16px);
  }

  .clock-icon {
    flex-shrink: 0;
    color: #555;
  }

  .timestamp-label {
    font-size: 13px;
    color: #333;
    user-select: none;
    white-space: nowrap;
  }

  .timestamp-time {
    cursor: pointer;
    font-weight: 600;
  }

  .timestamp-time:hover {
    text-decoration: underline;
  }

  .ts-inline-input {
    font-size: 13px;
    font-family: monospace;
    font-weight: 600;
    padding: 0 2px;
    border: none;
    border-bottom: 1px solid #999;
    border-radius: 0;
    outline: none;
    background: transparent;
    color: #333;
  }

  .ts-inline-input:focus {
    border-bottom-color: #1a1a1a;
  }

  .ts-inline-input.invalid {
    border-bottom-color: #e53935;
    color: #e53935;
  }

  .save-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #333;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s;
    flex-shrink: 0;
  }

  .save-btn:hover:not(:disabled) {
    background: #444;
  }

  .save-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }
</style>
