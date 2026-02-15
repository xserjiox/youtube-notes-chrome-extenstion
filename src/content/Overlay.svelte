<script>
  import { msg, isRTL } from '../lib/i18n.js';

  let { onclose, children, title = undefined } = $props();

  let mousedownOnBackdrop = false;
  let resolvedTitle = $derived(title ?? msg('common_videoNotes'));
  let dir = $derived(isRTL() ? 'rtl' : 'ltr');

  function handleMousedown(e) {
    mousedownOnBackdrop = e.target === e.currentTarget;
  }

  function handleBackdrop(e) {
    if (mousedownOnBackdrop && e.target === e.currentTarget) {
      onclose();
    }
    mousedownOnBackdrop = false;
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      onclose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="backdrop" onmousedown={handleMousedown} onclick={handleBackdrop}>
  <div class="modal" {dir}>
    <div class="modal-header">
      <h2>{resolvedTitle}</h2>
      <button class="close-btn" onclick={onclose}>&times;</button>
    </div>
    <div class="modal-body">
      {@render children()}
    </div>
    <div class="modal-footer">
      {msg('overlay_footer')}
    </div>
  </div>
</div>

<style>
  .backdrop {
    pointer-events: auto;
    position: fixed;
    inset: 0;
    background: var(--ytn-backdrop);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal {
    background: var(--ytn-surface);
    border-radius: 12px;
    width: 620px;
    max-width: 90vw;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: var(--ytn-shadow-lg);
    font-family: system-ui, -apple-system, sans-serif;
    color: var(--ytn-text);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--ytn-border-light);
  }

  .modal-header h2 {
    margin: 0;
    font-size: 16px;
    color: var(--ytn-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    flex: 1;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 22px;
    color: var(--ytn-icon-muted);
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
    flex-shrink: 0;
    margin-inline-start: 8px;
  }

  .close-btn:hover {
    color: var(--ytn-text-secondary);
  }

  .modal-body {
    padding: 16px 20px;
    overflow-y: auto;
    flex: 1;
  }

  .modal-footer {
    text-align: center;
    font-size: 11px;
    color: var(--ytn-text-muted);
    padding: 10px 20px;
    border-top: 1px solid var(--ytn-border-light);
  }
</style>
