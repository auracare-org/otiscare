<script lang="ts">
  import { pathwayRegistry } from '$lib/pathways/registry';
  import type { PathwayDefinition } from '$lib/pathways/types';
  import { onMount } from 'svelte';

  type PathwaySourceBundle = {
    definition: PathwayDefinition;
    metadata: any;
    notes: string[];
    sources: string[];
  };

  const bundles = $state<PathwaySourceBundle[]>([]);

  async function hydrate() {
    const results: PathwaySourceBundle[] = [];
    for (const def of pathwayRegistry) {
      const data = await def.getData();
      results.push({
        definition: def,
        metadata: data.metadata ?? {},
        notes: data.notes ?? [],
        sources: data.metadata?.sources ?? []
      });
    }
    bundles.splice(0, bundles.length, ...results);
  }

  onMount(() => {
    hydrate();
  });

  function exportPdf() {
    if (typeof window !== 'undefined') window.print();
  }
</script>

<section class="min-h-[calc(100vh-3.5rem)] bg-secondary-50 py-10 px-4">
  <div class="mx-auto flex max-w-5xl flex-col gap-6">
    <div class="rounded-3xl bg-white p-8 shadow-lg">
      <p class="text-sm uppercase tracking-wide text-healthcare-600 font-semibold mb-2">Reference hub</p>
      <h1 class="text-4xl font-bold text-neutral-900 mb-3">Pathway Sources</h1>
      <p class="text-neutral-700">
        Review provenance for each decision support workflow. Export to PDF when you need printable references for SOPs or audits.
      </p>
      <div class="mt-4">
        <button class="btn btn-secondary" onclick={exportPdf}>Export PDF summary</button>
      </div>
    </div>

    {#if bundles.length === 0}
      <div class="rounded-lg border border-dashed border-neutral-200 bg-white/80 p-6 text-sm text-neutral-500">
        Loading pathway references…
      </div>
    {:else}
      {#each bundles as entry (entry.definition.slug)}
        <section class="card p-6 space-y-4">
          <header class="flex flex-col gap-2 border-b border-neutral-100 pb-4">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <h2 class="text-2xl font-semibold">{entry.definition.title}</h2>
              <span class="text-xs uppercase tracking-wide text-neutral-500">{entry.definition.subtitle}</span>
            </div>
            <div class="grid gap-3 sm:grid-cols-3 text-sm text-neutral-600">
              <div>
                <div class="text-xs uppercase tracking-wide text-neutral-500">Version</div>
                <div class="font-semibold text-neutral-900">{entry.metadata.version ?? '—'}</div>
              </div>
              <div>
                <div class="text-xs uppercase tracking-wide text-neutral-500">Last updated</div>
                <div class="font-semibold text-neutral-900">{entry.metadata.lastUpdated ?? '—'}</div>
              </div>
              <div>
                <div class="text-xs uppercase tracking-wide text-neutral-500">Primary guideline</div>
                <div class="font-semibold text-neutral-900">{entry.metadata.niceGuideline ?? '—'}</div>
              </div>
            </div>
          </header>

          <article class="space-y-2">
            <h3 class="text-lg font-semibold">Care summary</h3>
            <ul class="list-disc pl-5 text-sm text-neutral-700">
              {#each entry.notes as note (note)}
                <li>{note}</li>
              {/each}
            </ul>
          </article>

          <article class="space-y-2">
            <h3 class="text-lg font-semibold">Primary references</h3>
            {#if entry.sources.length}
              <ol class="space-y-3 text-sm text-neutral-700 list-decimal pl-5">
                {#each entry.sources as src, index (src)}
                  <li>
                    <a href={src} rel="noreferrer" target="_blank" class="text-primary-600 underline">
                      Source {index + 1}
                    </a>
                    <div class="text-neutral-600 break-words">{src}</div>
                  </li>
                {/each}
              </ol>
            {:else}
              <p class="text-sm text-neutral-600">No external references listed.</p>
            {/if}
          </article>
        </section>
      {/each}
    {/if}

    <section class="card p-6 space-y-3">
      <h2 class="text-2xl font-semibold">Need another format?</h2>
      <p class="text-sm text-neutral-700">
        Contact the clinical safety team if you require printable briefing sheets, PGD extracts, or want to contribute new evidence for upcoming releases.
      </p>
      <a class="btn btn-secondary w-fit" href="mailto:clinical@auracare.org.uk">Email Clinical Safety</a>
    </section>
  </div>
</section>
