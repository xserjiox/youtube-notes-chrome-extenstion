<script>
  let { noteCount = 0, onclick } = $props();
  let posTop = $state(0);
  let posRight = $state(0);
  let visible = $state(false);

  function isFullscreen() {
    return !!document.fullscreenElement;
  }

  $effect(() => {
    function update() {
      const player = document.querySelector('#movie_player');
      if (!player) {
        visible = false;
        return;
      }

      if (player.classList.contains('ad-showing')) {
        visible = false;
        return;
      }

      if (isFullscreen()) {
        posTop = 10;
        posRight = 10;
        visible = true;
        return;
      }

      // Not fullscreen — only show when video is in viewport (not scrolled away)
      const rect = player.getBoundingClientRect();
      const playerVisible = rect.top > -rect.height && rect.bottom > 0;

      if (playerVisible) {
        posTop = rect.top + 10;
        posRight = window.innerWidth - rect.right + 10;
        visible = true;
      } else {
        visible = false;
      }
    }

    update();
    const interval = setInterval(update, 500);
    window.addEventListener('resize', update);
    document.addEventListener('fullscreenchange', update);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', update);
      document.removeEventListener('fullscreenchange', update);
    };
  });
</script>

{#if visible}
  <button
    class="fab"
    onclick={onclick}
    title="YouTube Notes"
    style="top: {posTop}px; right: {posRight}px;"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
    {#if noteCount > 0}
      <span class="badge">{noteCount}</span>
    {/if}
  </button>
{/if}

<style>
  .fab {
    pointer-events: auto;
    position: fixed;
    left: auto;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #1565c0;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    opacity: 0.1;
    transition: opacity 0.2s, background 0.15s;
  }

  .fab:hover {
    opacity: 1;
    background: #0d47a1;
  }

  .badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #e53935;
    color: white;
    font-size: 11px;
    font-weight: 700;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    font-family: system-ui, -apple-system, sans-serif;
  }
</style>
