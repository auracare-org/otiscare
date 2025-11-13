<script lang="ts">
  import DetailsView from '../DetailsView.svelte';
  let { question = 'Continue?', details = null, nodeId, columns = 2, onYes, onNo, onSelections } = $props<{
    question?: string;
    details?: unknown;
    nodeId?: string;
    columns?: 2 | 3;
    onYes: () => void;
    onNo: () => void;
    onSelections?: (e: { group?: string; total: number }) => void;
  }>();

  const selectedItems = $state<string[]>([]);

  function handleSelectionChange(e: { group?: string; total: number; items: string[] }) {
    selectedItems.splice(0, selectedItems.length, ...(e.items ?? []));
    if (onSelections) onSelections({ group: e.group, total: e.total });
  }

  async function copySelected() {
    if (!selectedItems.length) return;
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard) return;
      const text = selectedItems.map((item) => `• ${item}`).join('\n');
      await navigator.clipboard.writeText(text);
    } catch {}
  }
</script>

<div class="space-y-5">
  {#if question}
    <h3 class="text-xl font-semibold">{question}</h3>
  {/if}

  {#if details}
    <div class="text-sm text-neutral-700">
      <div class="details-scroll space-y-3 rounded-lg border border-neutral-100 bg-white/70 p-3">
        <DetailsView
          data={details}
          interactive
          {columns}
          group={nodeId}
          copyable={false}
          onChange={handleSelectionChange}
        />
      </div>
    </div>
  {/if}

  <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-100">
    {#if details}
      <button class="btn btn-secondary" onclick={copySelected} disabled={!selectedItems.length}>
        Copy selected
      </button>
    {/if}
    <div class="ml-auto flex gap-3">
      <button class="btn btn-primary" onclick={onYes}>Yes</button>
      <button class="btn btn-secondary" onclick={onNo}>No</button>
    </div>
  </div>
</div>

<style>
  .details-scroll {
    max-height: min(60vh, 520px);
    overflow-y: auto;
    scrollbar-gutter: stable;
  }
</style>
