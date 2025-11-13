<script lang="ts">
  export type Summary = {
    age?: number;
    durationDays?: number;
    strategy?: 'immediate' | 'backup' | null;
    diagnosis?: string | null;
    confidence?: number | null;
    selections?: Record<string, number>;
  };
  let { summary, path } = $props<{ summary: Summary; path: string[] }>();
  const marked = $derived(
    summary?.selections
      ? Object.values(summary.selections).reduce(
          (total: number, value) => total + (typeof value === 'number' ? value : 0),
          0
        )
      : 0
  );
</script>

<aside class="card p-4 md:sticky md:top-20 space-y-3 text-sm">
  <div class="font-semibold">Summary</div>
  <div class="grid grid-cols-2 gap-x-3 gap-y-1">
    <div class="text-neutral-500">Age</div>
    <div>{summary.age ?? '—'}</div>
    <div class="text-neutral-500">Duration</div>
    <div>{summary.durationDays ? `${summary.durationDays} d` : '—'}</div>
    <div class="text-neutral-500">Strategy</div>
    <div>{summary.strategy ? (summary.strategy === 'immediate' ? 'Immediate' : 'Back‑up') : '—'}</div>
    <div class="text-neutral-500">Marked</div>
    <div>{marked || '—'}</div>
  </div>

  {#if summary.diagnosis && summary.confidence}
    <div class="border-t border-neutral-200 pt-3 space-y-2">
      <div class="font-semibold text-neutral-700">AI Classifier</div>
      <div class="rounded-md px-3 py-2 {summary.diagnosis === 'pathological' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}">
        <div class="flex items-center gap-2 mb-1">
          <svg class="w-4 h-4 {summary.diagnosis === 'pathological' ? 'text-red-600' : 'text-green-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {#if summary.diagnosis === 'pathological'}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            {:else}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            {/if}
          </svg>
          <span class="font-medium {summary.diagnosis === 'pathological' ? 'text-red-800' : 'text-green-800'}">
            {summary.diagnosis === 'pathological' ? 'Pathological' : 'Normal'}
          </span>
        </div>
        <div class="text-xs {summary.diagnosis === 'pathological' ? 'text-red-700' : 'text-green-700'}">
          {Math.round(summary.confidence * 100)}% confidence
        </div>
      </div>
    </div>
  {/if}

  <div class="border-t border-neutral-200 pt-3">
    <div class="text-neutral-500 mb-1">Path</div>
    <div class="text-xs break-words">{path.join(' → ')}</div>
  </div>
</aside>
