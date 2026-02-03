<script>
  let { onclick, noteCount = 0, size = 48, title = 'YouTube Notes' } = $props();

  const iconSize = $derived(Math.round(size * 0.42));
</script>

<button class="fab" {onclick} {title} style="width: {size}px; height: {size}px;">
  <svg
    width={iconSize}
    height={iconSize}
    viewBox="0 0 24 24"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect x="3" y="7" width="12" height="15" rx="2" stroke="currentColor" stroke-width="1.8" />
    <path
      d="M9 7V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-3"
      stroke="currentColor"
      stroke-width="1.8"
    />
  </svg>
  {#if noteCount > 0}
    <span class="badge">{noteCount}</span>
  {/if}
</button>

<style>
  .fab {
    border-radius: 50%;
    background: #3a3a3a;
    color: #9e9e9e;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
    padding: 0;
    position: relative;
    transition: background 0.15s;
  }

  .fab:hover {
    background: #4a4a4a;
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
