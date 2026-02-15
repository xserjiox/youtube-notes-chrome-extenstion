<script>
  let { count } = $props();
</script>

<span class="badge">{count}</span>

<style>
  .badge {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 6px;
    background: var(--ytn-brand, #cc0000);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    border-radius: 12px;
  }
</style>
