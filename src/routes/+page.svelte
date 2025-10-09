<script lang="ts">
  import pathway from '$lib/nice_pathways/acute_otitis_media.json';
  import AgeDurationForm from '$lib/components/decision/AgeDurationForm.svelte';
  import DecisionTree from '$lib/components/decision/DecisionTree.svelte';
  import PathwayFooter from '$lib/components/decision/PathwayFooter.svelte';
  import type { PatientHistory as PH, DecisionNode } from '$lib/components/decision/types';
  import { fly } from 'svelte/transition';
  import { motion } from '$lib/ui/motion';
  import { onMount } from 'svelte';

  const aom = pathway as any;
  const root: DecisionNode = aom.decisionTree;
  const notes: string[] = aom.notes ?? [];
  const metadata = aom.metadata ?? {};

  type Step = 'landing' | 'age' | 'tree';
  let step: Step = $state('landing');
  let history: PH = $state({});

  function handleStart() {
    step = 'age';
    try { localStorage.setItem('otoscopy.step', 'age'); } catch {}
  }

  function handleAgeSubmit(partial: Pick<PH, 'age' | 'durationDays'>) {
    history = { ...history, ...partial };
    step = 'tree';
    try {
      localStorage.setItem('otoscopy.history', JSON.stringify(history));
      localStorage.setItem('otoscopy.step', 'tree');
    } catch {}
  }

  function handleStartOver() {
    history = {} as PH;
    step = 'landing';
    try {
      localStorage.removeItem('otoscopy.step');
      localStorage.removeItem('otoscopy.history');
      localStorage.removeItem('otoscopy.path');
      localStorage.removeItem('otoscopy.summary');
      localStorage.removeItem('otoscopy.active');
    } catch {}
  }

  onMount(() => {
    try {
      const savedHistory = localStorage.getItem('otoscopy.history');
      const savedPath = localStorage.getItem('otoscopy.path');
      if (savedHistory) history = JSON.parse(savedHistory);
      if (savedPath) {
        const arr = JSON.parse(savedPath);
        if (Array.isArray(arr) && arr.length > 1 && arr[0] === root.id) {
          step = 'tree';
          localStorage.setItem('otoscopy.step', 'tree');
          return;
        }
      }
      const savedStep = localStorage.getItem('otoscopy.step');
      if (savedStep === 'age') step = 'age';
      else if (savedStep === 'tree') step = 'tree';
    } catch {}
  });
</script>

<section class="min-h-screen flex flex-col">
  

  <div class="flex-1 flex items-center justify-center p-6">
    {#if step === 'landing'}
      <div class="w-full max-w-2xl text-center" in:fly={{ x: motion.fromRightX, duration: motion.durationIn }}>
        <h1 class="mb-4">Ear Infection Decision Support</h1>
        <p class="text-lg text-neutral-700 mb-6">Clinical pathway: Acute Otitis Media in children and young people (1–17 years). Use shared decision-making and clinician global impression throughout.</p>
        <div class="card p-6 space-y-3 mb-6">
          <h3 class="mb-1">About this assessment</h3>
          <ul class="list-disc pl-5 text-neutral-700 text-left">
            {#each notes.slice(0, 3) as n, i (n)}
              <li>{n}</li>
            {/each}
          </ul>
        </div>
        <button class="btn btn-healthcare btn-lg" on:click={handleStart}>Start Assessment</button>
      </div>
    {:else if step === 'age'}
      <AgeDurationForm onSubmit={handleAgeSubmit} />
    {:else}
      <div class="w-full max-w-5xl" in:fly={{ x: motion.fromRightX, duration: motion.durationIn }}>
        <DecisionTree root={root} history={history} />
      </div>
    {/if}
  </div>
</section>

<div class="container mx-auto px-4 pb-6">
  <div class="flex justify-end">
    {#if step !== 'landing'}
      <button class="btn btn-secondary" on:click={handleStartOver}>Start Over</button>
    {/if}
  </div>
  
</div>

<PathwayFooter metadata={metadata} />
