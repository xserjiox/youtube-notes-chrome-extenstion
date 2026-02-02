<script>
  import { formatTimestamp, parseTimestamp } from '../lib/utils.js';

  let { value = $bindable(0), min = 0, max = null, disabled = false } = $props();
  let editing = $state(false);
  let inputText = $state('');
  let inputEl = $state(null);
  let error = $state(false);

  let display = $derived(formatTimestamp(value) ?? '0:00');

  function startEdit() {
    if (disabled) return;
    inputText = display;
    error = false;
    editing = true;
    // Wait for DOM update, then focus
    queueMicrotask(() => {
      inputEl?.focus();
      inputEl?.select();
    });
  }

  function clamp(v) {
    if (v < min) return min;
    if (max != null && v > max) return max;
    return v;
  }

  function confirm() {
    const parsed = parseTimestamp(inputText.trim());
    if (parsed == null) {
      error = true;
      return;
    }
    value = clamp(parsed);
    editing = false;
    error = false;
  }

  function cancel() {
    editing = false;
    error = false;
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  }
</script>

{#if editing}
  <span class="picker-edit">
    <input
      bind:this={inputEl}
      bind:value={inputText}
      class="picker-input"
      class:invalid={error}
      placeholder="0:00"
      onkeydown={handleKeydown}
      onblur={confirm}
    />
    {#if max != null}
      <span class="picker-hint">max {formatTimestamp(max)}</span>
    {/if}
  </span>
{:else}
  <button class="picker-display" class:disabled onclick={startEdit}>{display}</button>
{/if}

<style>
  .picker-display {
    display: inline-block;
    background: #e3f2fd;
    color: #1565c0;
    font-size: 11px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 4px;
    font-family: monospace;
    border: 1px solid transparent;
    cursor: pointer;
  }

  .picker-display:hover:not(.disabled) {
    background: #bbdefb;
  }

  .picker-display.disabled {
    opacity: 0.5;
    cursor: default;
  }

  .picker-edit {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .picker-input {
    width: 64px;
    font-size: 11px;
    font-family: monospace;
    font-weight: 600;
    padding: 1px 6px;
    border: 1px solid #1565c0;
    border-radius: 4px;
    outline: none;
    background: #e3f2fd;
    color: #1565c0;
  }

  .picker-input.invalid {
    border-color: #e53935;
    background: #ffebee;
    color: #e53935;
  }

  .picker-hint {
    font-size: 10px;
    color: #999;
    font-family: monospace;
    white-space: nowrap;
  }
</style>
