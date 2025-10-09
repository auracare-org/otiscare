<script lang="ts">
  import { slide } from 'svelte/transition';
  import DetailsView from '../DetailsView.svelte';
  import { motion } from '$lib/ui/motion';
  import { fly } from 'svelte/transition';
  let { question = 'Continue?', details = null, nodeId, columns = 2, onYes, onNo, onSelections } = $props<{
    question?: string;
    details?: unknown;
    nodeId?: string;
    columns?: 2 | 3;
    onYes: () => void;
    onNo: () => void;
    onSelections?: (e: { group?: string; total: number }) => void;
  }>();
</script>

<div class="card p-6 card-hover" in:fly={{ x: motion.fromRightX, duration: motion.durationIn }}>
  {#if question}
    <h3 class="mb-3">{question}</h3>
  {/if}

  {#if details}
    <div class="text-sm text-neutral-700 space-y-2 mb-6">
      <DetailsView
        data={details}
        interactive
        {columns}
        group={nodeId}
        onChange={(e) => onSelections && onSelections({ group: e.group, total: e.total })}
      />
    </div>
  {/if}

  <div class="flex gap-3">
    <button class="btn btn-primary" on:click={onYes}>Yes</button>
    <button class="btn btn-secondary" on:click={onNo}>No</button>
  </div>
</div>
