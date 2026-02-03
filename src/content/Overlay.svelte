<script>
  let { onclose, children, title = 'Video Notes' } = $props();

  let mousedownOnBackdrop = false;

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
  <div class="modal">
    <div class="modal-header">
      <h2>{title}</h2>
      <button class="close-btn" onclick={onclose}>&times;</button>
    </div>
    <div class="modal-body">
      {@render children()}
    </div>
    <div class="modal-footer">
      Press Esc to close &bull; Click outside to dismiss
    </div>
  </div>
</div>

<style>
  .backdrop {
    pointer-events: auto;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal {
    background: white;
    border-radius: 12px;
    width: 620px;
    max-width: 90vw;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    font-family: system-ui, -apple-system, sans-serif;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 16px;
    color: #1a1a1a;
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
    color: #999;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
    flex-shrink: 0;
    margin-left: 8px;
  }

  .close-btn:hover {
    color: #333;
  }

  .modal-body {
    padding: 16px 20px;
    overflow-y: auto;
    flex: 1;
  }

  .modal-footer {
    text-align: center;
    font-size: 11px;
    color: #999;
    padding: 10px 20px;
    border-top: 1px solid #eee;
  }
</style>
