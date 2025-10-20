<script lang="ts">
  import { fly } from 'svelte/transition';
  import { motion } from '$lib/ui/motion';
  import type { PatientHistory } from './types';

  let { onSubmit } = $props<{ onSubmit: (history: Pick<PatientHistory, 'age' | 'durationDays'>) => void }>();

  let dateOfBirth: string = '';
  let durationDays: number | '' = '';

  function calculateAge(dob: string): number | undefined {
    if (!dob) return undefined;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : undefined;
  }

  function submit(e: Event) {
    e.preventDefault();
    const age = calculateAge(dateOfBirth);
    const payload = {
      age,
      durationDays: typeof durationDays === 'number' ? durationDays : undefined
    } as Pick<PatientHistory, 'age' | 'durationDays'>;
    onSubmit(payload);
  }
</script>

<form class="card p-8 w-full max-w-xl space-y-5" on:submit={submit} in:fly={{ x: motion.fromRightX, duration: motion.durationIn }}>
  <h3 class="text-2xl">Patient Details</h3>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
    <label class="flex flex-col gap-2">
      <span class="text-sm text-neutral-600">Date of Birth</span>
      <input class="border rounded px-3 py-2" type="date" bind:value={dateOfBirth} required max={new Date().toISOString().split('T')[0]} />
    </label>
    <label class="flex flex-col gap-2">
      <span class="text-sm text-neutral-600">Symptom Duration (days)</span>
      <input class="border rounded px-3 py-2" type="number" min="0" bind:value={durationDays} required />
    </label>
  </div>
  <div class="pt-2">
    <button type="submit" class="btn btn-healthcare btn-lg w-full">Continue</button>
  </div>
</form>

