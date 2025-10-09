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
  const marked = $derived(summary?.selections ? Object.values(summary.selections).reduce((a, b) => a + (b || 0), 0) : 0);
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
    <div class="text-neutral-500">Diagnosis</div>
    <div>{summary.diagnosis ?? '—'} {summary.confidence ? `(${Math.round(summary.confidence * 100)}%)` : ''}</div>
    <div class="text-neutral-500">Marked</div>
    <div>{marked || '—'}</div>
  </div>
  <div class="text-neutral-500">Path</div>
  <div class="text-xs break-words">{path.join(' → ')}</div>
</aside>
