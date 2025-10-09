<script lang="ts">
  import { fly } from 'svelte/transition';
  import { motion } from '$lib/ui/motion';
  import type { PatientHistory } from './types';

  let { onSubmit } = $props<{ onSubmit: (history: Pick<PatientHistory, 'age' | 'durationDays'>) => void }>();

  let age: number | '' = '';
  let durationDays: number | '' = '';

  function submit(e: Event) {
    e.preventDefault();
    const payload = {
      age: typeof age === 'number' ? age : undefined,
      durationDays: typeof durationDays === 'number' ? durationDays : undefined
    } as Pick<PatientHistory, 'age' | 'durationDays'>;
    onSubmit(payload);
  }
</script>

<form class="card p-8 w-full max-w-xl space-y-5" on:submit={submit} in:fly={{ x: motion.fromRightX, duration: motion.durationIn }}>
  <h3 class="text-2xl">Patient Details</h3>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
    <label class="flex flex-col gap-2">
      <span class="text-sm text-neutral-600">Age (years)</span>
      <input class="border rounded px-3 py-2" type="number" min="0" bind:value={age} required />
    </label>
    <label class="flex flex-col gap-2">
      <span class="text-sm text-neutral-600">Duration (days)</span>
      <input class="border rounded px-3 py-2" type="number" min="0" bind:value={durationDays} required />
    </label>
  </div>
  <div class="pt-2">
    <button type="submit" class="btn btn-healthcare btn-lg w-full">Continue</button>
  </div>
</form>

