<script>
  import FabButton from '../components/FabButton.svelte';

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
        posTop = 20;
        posRight = 10;
        visible = true;
        return;
      }

      // Not fullscreen — only show when video is in viewport (not scrolled away)
      const rect = player.getBoundingClientRect();
      const playerVisible = rect.top > -rect.height && rect.bottom > 0;

      if (playerVisible) {
        posTop = rect.top + 20;
        posRight = window.innerWidth - rect.right + 5;
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
  <div class="trigger" style="top: {posTop}px; right: {posRight}px;">
    <FabButton {onclick} {noteCount} />
  </div>
{/if}

<style>
  .trigger {
    pointer-events: auto;
    position: fixed;
    left: auto;
    opacity: 0.85;
    transition: opacity 0.2s;
  }

  .trigger:hover {
    opacity: 1;
  }
</style>
