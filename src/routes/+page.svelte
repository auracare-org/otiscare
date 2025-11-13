<script lang="ts">
  import { pathwayRegistry } from '$lib/pathways/registry';
</script>

<section class="min-h-[calc(100vh-3.5rem)] bg-secondary-50 py-10 px-4">
  <div class="mx-auto max-w-6xl space-y-8">
    <header class="rounded-3xl bg-white p-8 shadow-lg">
      <p class="text-sm uppercase tracking-wide text-healthcare-600 font-semibold">Clinical workspace</p>
      <h1 class="text-4xl font-bold text-neutral-900 mt-2">Select a pathway</h1>
      <p class="mt-3 text-neutral-700 max-w-3xl">
        Launch structured decision support across Pharmacy First and other otology pathways. Choose a workflow below to capture history, run branching logic, and export a clinical summary.
      </p>
    </header>

    <div class="grid gap-5 md:grid-cols-2">
      {#each pathwayRegistry as entry (entry.slug)}
        <article class="card p-6 space-y-3 hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-semibold">{entry.title}</h2>
            <span class="text-xs uppercase tracking-wide text-neutral-500">{entry.ageRange}</span>
          </div>
          <p class="text-sm text-neutral-600">{entry.subtitle}</p>
          {#if entry.summaryPoints?.length}
            <ul class="list-disc pl-5 text-sm text-neutral-700 space-y-1">
              {#each entry.summaryPoints.slice(0, 3) as point (point)}
                <li>{point}</li>
              {/each}
            </ul>
          {/if}
          <div class="flex flex-wrap gap-2 text-xs text-neutral-500">
            <span class="rounded-full bg-neutral-100 px-3 py-1">{entry.setting}</span>
            {#each entry.tags ?? [] as tag (tag)}
              <span class="rounded-full bg-neutral-100 px-3 py-1">{tag}</span>
            {/each}
          </div>
          <a class="btn btn-healthcare w-full justify-center" href={`/pathway/${entry.slug}`}>Launch assessment</a>
        </article>
      {/each}
    </div>
  </div>
</section>
