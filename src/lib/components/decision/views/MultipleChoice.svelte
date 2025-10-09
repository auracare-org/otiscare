<script lang="ts">
  import { fly } from 'svelte/transition';
  import { motion } from '$lib/ui/motion';
  type Option = { label: string; value: string };

  let { prompt, options = [], onSelect } = $props<{
    prompt: string;
    options: Option[];
    onSelect: (value: string) => void;
  }>();
</script>

<div class="card p-6 card-hover" in:fly={{ x: motion.fromRightX, duration: motion.durationIn }}>
  <h3 class="mb-4">{prompt}</h3>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {#each options as opt, i (opt.value)}
      <button
        class="btn btn-healthcare btn-lg"
        on:click={() => onSelect(opt.value)}
        aria-label={opt.label}
        in:fly={{ x: motion.fromRightX, delay: i * motion.delayStep, duration: motion.durationItemIn }}
      >
        {opt.label}
      </button>
    {/each}
  </div>
  {#if options.length === 0}
    <p class="text-neutral-500">No options available.</p>
  {/if}
  
</div>
