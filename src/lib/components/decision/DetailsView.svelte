<script lang="ts">
  import { fly } from 'svelte/transition';
  import { motion } from '$lib/ui/motion';
  import RecursiveDetailsView from './DetailsView.svelte';
  let { data, interactive = false, columns = 2, group = undefined, onChange = undefined, copyable = true } = $props<{
    data: unknown;
    interactive?: boolean;
    columns?: 2 | 3;
    group?: string;
    onChange?: (e: { group?: string; total: number; items: string[] }) => void;
    copyable?: boolean;
  }>();

  function isObject(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
  }

  function formatKey(key: string) {
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .replace(/^./, (s) => s.toUpperCase());
  }

  // Simple local selection store when rendering interactive checkboxes
  const selected = $state<Set<string>>(new Set());
  function toggleSel(section: string, idx: number) {
    const key = `${section}::${idx}`;
    if (selected.has(key)) selected.delete(key);
    else selected.add(key);
    if (onChange) onChange({ group, total: selected.size, items: selectionItems() });
  }

  function isObjectOfStringArrays(v: unknown): v is Record<string, string[]> {
    if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
    for (const [_, val] of Object.entries(v as Record<string, unknown>)) {
      if (!Array.isArray(val)) return false;
      if (!val.every((x) => typeof x === 'string')) return false;
    }
    return true;
  }

  function selectionItems(): string[] {
    const items: string[] = [];
    if (Array.isArray(data)) {
      data.forEach((item, i) => {
        if (selected.has(`list::${i}`)) items.push(String(item));
      });
    } else if (isObjectOfStringArrays(data)) {
      for (const [key, arr] of Object.entries(data)) {
        arr.forEach((v, j) => {
          if (selected.has(`${key}::${j}`)) items.push(`${formatKey(key)}: ${v}`);
        });
      }
    }
    return items;
  }

  async function copySelected() {
    try {
      const items = selectionItems();
      if (!items.length) return;
      const text = items.map((s) => `• ${s}`).join('\n');
      await navigator.clipboard.writeText(text);
    } catch {}
  }
</script>

{#if Array.isArray(data)}
  {#if interactive}
    <div class="space-y-2">
      {#each data as item, i (i)}
        <label class="flex items-start gap-3" in:fly={{ x: motion.fromRightX, delay: i * motion.delayStepSm, duration: motion.durationItemIn }}>
          <input type="checkbox" class="flex-shrink-0" onchange={() => toggleSel('list', i)} />
          <span>{String(item)}</span>
        </label>
      {/each}
      {#if copyable}
        <div class="flex justify-end mt-4">
          <button type="button" class="btn btn-secondary" onclick={copySelected}>Copy selected</button>
        </div>
      {/if}
    </div>
  {:else}
    <ul class="list-disc pl-5">
      {#each data as item, i (i)}
        <li in:fly={{ x: motion.fromRightX, delay: i * motion.delayStepSm, duration: motion.durationItemIn }}>{String(item)}</li>
      {/each}
    </ul>
  {/if}
{:else if isObjectOfStringArrays(data) && interactive}
  {#key columns}
    <div class={`grid grid-cols-1 ${columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 items-start`}>
      {#each Object.entries(data) as [key, value], i (key)}
        <div class="space-y-2 rounded-md border border-neutral-100 bg-white/50 p-4" in:fly={{ x: motion.fromRightX, delay: i * motion.delayStep, duration: motion.durationItemIn }}>
          <div class="font-medium text-neutral-700">{formatKey(key)}</div>
          <div class="space-y-2">
            {#each value as v, j (j)}
              <label class="flex items-start gap-3">
                <input type="checkbox" class="flex-shrink-0" onchange={() => toggleSel(key, j)} />
                <span>{v}</span>
              </label>
            {/each}
          </div>
        </div>
      {/each}
      {#if copyable}
        <div class="col-span-full flex justify-end mt-4">
          <button type="button" class="btn btn-secondary" onclick={copySelected}>Copy selected</button>
        </div>
      {/if}
    </div>
  {/key}
{:else if isObject(data)}
  <div class="space-y-3">
    {#each Object.entries(data) as [key, value], i (key)}
      <div class="space-y-1" in:fly={{ x: motion.fromRightX, delay: i * motion.delayStep, duration: motion.durationItemIn }}>
        <div class="font-medium text-neutral-700">{formatKey(key)}</div>
        <div class="pl-3">
          <RecursiveDetailsView data={value} {interactive} {columns} {group} {onChange} {copyable} />
        </div>
      </div>
    {/each}
  </div>
{:else if data !== null && data !== undefined}
  <p>{String(data)}</p>
{/if}
