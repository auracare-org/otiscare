<script lang="ts">
  import type { ActionNode, TreatmentNode } from './types';
  import { fly } from 'svelte/transition';
  import { motion } from '$lib/ui/motion';

  let { node } = $props<{ node: ActionNode | TreatmentNode }>();
</script>

<div class="card p-6 space-y-3" in:fly={{ x: motion.fromRightX, duration: motion.durationIn }}>
  <h3>{node.title ?? 'Summary'}</h3>

  {#if 'drug' in node && node.drug}
    <p><strong>Drug:</strong> {node.drug}</p>
  {/if}

  {#if 'durationDays' in node && node.durationDays}
    <p><strong>Duration:</strong> {node.durationDays} days</p>
  {/if}

  {#if 'route' in node && node.route}
    <p><strong>Route:</strong> {node.route}</p>
  {/if}

  {#if Array.isArray((node as any).actions)}
    <ul class="list-disc pl-5 text-neutral-700">
      {#each (node as any).actions as a, i (a)}
        <li in:slide={{ y: motion.slideItemY, delay: i * motion.delayStep, duration: motion.durationItemIn }}>{a}</li>
      {/each}
    </ul>
  {/if}

  {#if 'followUp' in node && node.followUp}
    <p class="text-sm text-neutral-600"><strong>Follow up:</strong> {(node as any).followUp}</p>
  {/if}

  {#if 'dose' in node && (node as any).dose}
    <div class="mt-2">
      <div class="font-medium">Dose</div>
      {#if typeof (node as any).dose === 'string'}
        <p>{(node as any).dose}</p>
      {:else}
        <div class="text-sm space-y-1">
          {#each Object.entries((node as any).dose) as [k, v]}
            <div>
              <span class="font-medium">{k}:</span>
              {#if typeof v === 'string'}
                <span> {v}</span>
              {:else}
                <ul class="list-disc pl-5">
                  {#each Object.entries(v as Record<string,string>) as [kk, vv]}
                    <li><span class="font-medium">{kk}</span>: {vv}</li>
                  {/each}
                </ul>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  {#if 'formulations' in node && Array.isArray((node as any).formulations)}
    <div class="mt-2">
      <div class="font-medium">Formulations</div>
      <ul class="list-disc pl-5 text-neutral-700">
        {#each (node as any).formulations as f}
          <li>{f}</li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
