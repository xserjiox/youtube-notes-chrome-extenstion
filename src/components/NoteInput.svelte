<script>
  import TimestampPicker from './TimestampPicker.svelte';

  let { onsave, timestamp = $bindable(null), duration = null, adPlaying = false, showTimestampToggle = false } = $props();

  let text = $state('');
  let useTimestamp = $state(true);

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
</script>

<div class="note-input">
  <textarea
    bind:value={text}
    placeholder="Add a note..."
    rows="2"
    onkeydown={handleKeydown}
  ></textarea>
  <div class="input-actions">
    {#if showTimestampToggle}
      <label class="timestamp-toggle">
        <input type="checkbox" bind:checked={useTimestamp} />
        <span class="toggle-label">Timestamp</span>
      </label>
      {#if useTimestamp && timestamp != null}
        <TimestampPicker bind:value={timestamp} min={0} max={duration} disabled={adPlaying} />
      {/if}
    {/if}
    <button class="save-btn" onclick={handleSave} disabled={!text.trim()}>Save</button>
  </div>
</div>

<style>
  .note-input {
    margin-top: 8px;
  }

  textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 8px;
    font-family: inherit;
    font-size: 13px;
    resize: vertical;
    min-height: 50px;
    outline: none;
  }

  textarea:focus {
    border-color: var(--ytn-brand);
  }

  .input-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 6px;
  }

  .timestamp-toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #666;
    cursor: pointer;
  }

  .timestamp-toggle input {
    margin: 0;
  }

  .toggle-label {
    user-select: none;
  }

  .save-btn {
    background: var(--ytn-brand);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 16px;
    font-size: 13px;
    cursor: pointer;
  }

  .save-btn:hover:not(:disabled) {
    background: var(--ytn-brand-hover);
  }

  .save-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }
</style>
