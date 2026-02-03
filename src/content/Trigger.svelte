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
    let playerObserver = null;
    let observedPlayer = null;

    function update() {
      const player = document.querySelector('#movie_player');
      if (!player) {
        visible = false;
        return;
      }

      // Observe player class changes (ad-showing, theater mode)
      if (player !== observedPlayer) {
        playerObserver?.disconnect();
        playerObserver = new MutationObserver(update);
        playerObserver.observe(player, { attributes: true, attributeFilter: ['class'] });
        observedPlayer = player;
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
    // Retry for async player loading
    const retry1 = setTimeout(update, 1000);
    const retry2 = setTimeout(update, 3000);

    let rafId = 0;
    function onScroll() {
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          rafId = 0;
          update();
        });
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    document.addEventListener('fullscreenchange', update);
    window.addEventListener('yt-navigate-finish', update);

    return () => {
      clearTimeout(retry1);
      clearTimeout(retry2);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      document.removeEventListener('fullscreenchange', update);
      window.removeEventListener('yt-navigate-finish', update);
      playerObserver?.disconnect();
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
