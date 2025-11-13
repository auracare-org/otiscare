<script lang="ts">
  import { fly } from 'svelte/transition';
  import { motion } from '$lib/ui/motion';
  import type { PatientHistory } from './types';
  
  let { onSubmit } = $props<{ onSubmit: (history: PatientHistory) => void }>();

  let age = $state<number | ''>('');
  let durationDays = $state<number | ''>('');
  let bilateral = $state(false);
  let otorrhoea = $state(false);
  let penicillinAllergy = $state(false);
  let severity = $state<'mild' | 'moderate' | 'severe' | ''>('');
  let fever = $state(false);

  function submit(e: Event) {
    e.preventDefault();
    onSubmit({
      age: typeof age === 'number' ? age : undefined,
      durationDays: typeof durationDays === 'number' ? durationDays : undefined,
      bilateral,
      otorrhoea,
      penicillinAllergy,
      severity: severity || undefined,
      fever
    });
  }
</script>

<form class="card p-6 space-y-4" onsubmit={submit} in:fly={{ y: motion.slideY, duration: motion.durationIn }} out:fly={{ y: -motion.slideY, duration: motion.durationOut }}>
  <h3 class="mb-2">Patient History</h3>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <label class="flex flex-col gap-1" in:fly={{ y: motion.slideItemY, delay: 0, duration: motion.durationItemIn }}>
      <span class="text-sm text-neutral-600">Age (years)</span>
      <input class="border rounded px-3 py-2" type="number" min="0" bind:value={age} />
    </label>

    <label class="flex flex-col gap-1" in:fly={{ y: motion.slideItemY, delay: 1 * motion.delayStepSm, duration: motion.durationItemIn }}>
      <span class="text-sm text-neutral-600">Duration (days)</span>
      <input class="border rounded px-3 py-2" type="number" min="0" bind:value={durationDays} />
    </label>

    <label class="flex items-center gap-2" in:fly={{ y: motion.slideItemY, delay: 2 * motion.delayStepSm, duration: motion.durationItemIn }}>
      <input type="checkbox" bind:checked={bilateral} />
      Bilateral infection
    </label>

    <label class="flex items-center gap-2" in:fly={{ y: motion.slideItemY, delay: 3 * motion.delayStepSm, duration: motion.durationItemIn }}>
      <input type="checkbox" bind:checked={otorrhoea} />
      Otorrhoea / discharge
    </label>

    <label class="flex items-center gap-2" in:fly={{ y: motion.slideItemY, delay: 4 * motion.delayStepSm, duration: motion.durationItemIn }}>
      <input type="checkbox" bind:checked={penicillinAllergy} />
      Penicillin allergy
    </label>

    <label class="flex items-center gap-2" in:fly={{ y: motion.slideItemY, delay: 5 * motion.delayStepSm, duration: motion.durationItemIn }}>
      <input type="checkbox" bind:checked={fever} />
      Fever
    </label>
  </div>

  <div>
    <span class="block text-sm text-neutral-600 mb-2">Severity</span>
    <div class="flex flex-wrap gap-2">
      {#each ['mild','moderate','severe'] as s, i (s)}
        <button
          type="button"
          class={`btn ${severity === s ? 'btn-primary' : 'btn-secondary'} btn-lg`}
          onclick={() => (severity = s as any)}
          in:fly={{ y: motion.slideItemY, delay: i * motion.delayStepSm, duration: motion.durationItemIn }}
        >{s}</button>
      {/each}
    </div>
  </div>

  <div class="pt-2">
    <button type="submit" class="btn btn-healthcare btn-lg">Start Assessment</button>
  </div>
</form>
