<script lang="ts">
  type Meta = {
    version?: string;
    lastUpdated?: string;
    sources?: string[];
    niceGuideline?: string;
  };
  let { metadata } = $props<{ metadata: Meta }>();
</script>

<footer class="w-full border-t border-neutral-100 text-xs text-neutral-600 bg-secondary-50/60">
  <div class="container mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
    {#if metadata?.lastUpdated}
      <div>Last updated: <span class="font-medium">{metadata.lastUpdated}</span></div>
    {/if}
    {#if metadata?.version}
      <div>Version: <span class="font-medium">{metadata.version}</span></div>
    {/if}
    {#if metadata?.niceGuideline}
      <div>NICE: <span class="font-medium">{metadata.niceGuideline}</span></div>
    {/if}
    {#if Array.isArray(metadata?.sources) && metadata.sources.length}
      <div class="truncate">
        Sources:
        {#each metadata.sources as url, i}
          <a class="underline hover:no-underline" href={url} rel="noopener noreferrer" target="_blank">[{i + 1}]</a>{i < metadata.sources.length - 1 ? ' ' : ''}
        {/each}
      </div>
    {/if}
  </div>
</footer>

