<script>
  import NoteInput from './NoteInput.svelte';
  import NotesList from './NotesList.svelte';
  import Badge from './Badge.svelte';
  import { getThumbnailUrl } from '../lib/utils.js';
  import { msg, plural } from '../lib/i18n.js';

  let { video, notes, onaddnote, ondeletenote, ondeleteall, oneditnote, onseek } = $props();

  let expanded = $state(false);
  let showInput = $state(false);

  function toggle() {
    expanded = !expanded;
  }

  function toggleInput() {
    showInput = !showInput;
  }

  function handleSave(text) {
    onaddnote?.(video.videoId, text);
    showInput = false;
  }
</script>

<section class="accordion" class:collapsed={!expanded}>
  <div class="accordion-top" onclick={toggle} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }}} role="button" tabindex="0">
    <div class="accordion-header">
      <svg class="chevron" class:rotated={!expanded} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
      <img class="thumbnail" src={getThumbnailUrl(video.videoId)} alt="" />
      <div class="header-info">
        <h2 class="video-title">{video.title || video.videoId}</h2>
      </div>
      <Badge count={notes.length} />
    </div>

    <div class="video-meta">
      {#if video.url}
        <a class="youtube-link" href={video.url} target="_blank" rel="noopener" onclick={(e) => e.stopPropagation()}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          {msg('common_openOnYouTube')}
        </a>
      {/if}
      <span class="meta-separator">&middot;</span>
      <span class="meta-count">{plural('notesList_count', notes.length)}</span>
    </div>
  </div>

  {#if expanded}
    <div class="accordion-body">
      <div class="accordion-actions">
        <button class="secondary add-note-btn" onclick={toggleInput}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {msg('videoAccordion_addNote')}
        </button>
        <button class="secondary delete-all-btn" onclick={() => ondeleteall?.(video.videoId)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          {msg('common_deleteAll')}
        </button>
      </div>

      {#if showInput}
        <div class="note-input-wrapper">
          <NoteInput onsave={handleSave} />
        </div>
      {/if}

      <NotesList
        {notes}
        expanded={true}
        ondelete={(noteId) => ondeletenote?.(video.videoId, noteId)}
        onedit={(noteId, newText) => oneditnote?.(video.videoId, noteId, newText)}
        onseek={(seconds) => onseek?.(video.videoId, seconds)}
      />
    </div>
  {/if}
</section>

<style>
  .accordion {
    background: var(--ytn-surface);
    border-radius: 12px;
    box-shadow: var(--ytn-shadow-md);
    margin-bottom: 16px;
    overflow: hidden;
  }

  .accordion-top {
    cursor: pointer;
    user-select: none;
    transition: background 0.15s;
  }

  .accordion-top:hover {
    background: var(--ytn-surface-hover);
  }

  .accordion-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px 0;
  }

  .chevron {
    flex-shrink: 0;
    color: var(--ytn-icon);
    transition: transform 0.2s ease;
  }

  .chevron.rotated {
    transform: rotate(-90deg);
  }

  .thumbnail {
    flex-shrink: 0;
    width: 120px;
    height: 68px;
    border-radius: 8px;
    object-fit: cover;
  }

  .header-info {
    flex: 1;
    min-width: 0;
  }

  .video-title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--ytn-text);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .video-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    padding: 6px 20px 14px;
    padding-inline-start: 48px;
  }

  .accordion-body {
    padding: 16px 20px 16px;
    padding-inline-start: 48px;
  }

  .youtube-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--ytn-brand, #cc0000);
    text-decoration: none;
    font-weight: 500;
  }

  .youtube-link:hover {
    text-decoration: underline;
  }

  .meta-separator {
    color: var(--ytn-text-muted);
  }

  .meta-count {
    color: var(--ytn-text-muted);
  }

  .secondary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 500;
    color: var(--ytn-text-secondary);
    background: var(--ytn-surface);
    border: 1px solid var(--ytn-border);
    border-radius: 8px;
    cursor: pointer;
    font-family: inherit;
  }

  .secondary:hover {
    background: var(--ytn-surface-hover);
  }

  .accordion-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .delete-all-btn {
    color: var(--ytn-error, #e53935);
  }

  .delete-all-btn:hover {
    background: var(--ytn-error, #e53935);
    color: #fff;
    border-color: var(--ytn-error, #e53935);
  }

  .note-input-wrapper {
    margin-bottom: 12px;
  }
</style>
