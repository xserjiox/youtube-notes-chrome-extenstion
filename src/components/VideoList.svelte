<script>
  import VideoEntry from './VideoEntry.svelte';

  let { videos, onselect } = $props();
</script>

{#if videos.length === 0}
  <p class="empty">No videos with notes yet.</p>
{:else}
  <div class="video-list">
    {#each videos as video (video.videoId)}
      <VideoEntry {video} onclick={onselect} />
    {/each}
  </div>
{/if}

<style>
  .video-list {
    margin: 0;
    padding: 0;
  }

  .empty {
    color: #999;
    font-size: 13px;
    margin: 12px 0;
  }
</style>
