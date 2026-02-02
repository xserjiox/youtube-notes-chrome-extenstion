<script>
  let { video, onclick } = $props();
</script>

<button class="video-entry" onclick={() => onclick(video)}>
  <div class="video-info">
    <span class="video-title">{video.title || video.videoId}</span>
    <span class="note-count">{video.noteCount} note{video.noteCount === 1 ? '' : 's'}</span>
  </div>
  <span class="chevron">&#8250;</span>
</button>

<style>
  .video-entry {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 10px 0;
    border: none;
    border-bottom: 1px solid #eee;
    background: none;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
  }

  .video-entry:hover {
    background: #f5f5f5;
  }

  .video-info {
    flex: 1;
    min-width: 0;
  }

  .video-title {
    display: block;
    font-size: 13px;
    color: #1a1a1a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .note-count {
    font-size: 11px;
    color: #888;
  }

  .chevron {
    color: #ccc;
    font-size: 18px;
    margin-left: 8px;
  }
</style>
