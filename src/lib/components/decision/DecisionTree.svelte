<script lang="ts">
  import { fly } from 'svelte/transition';
  import { tick, onMount } from 'svelte';
  import YesNo from './views/YesNo.svelte';
  import MultipleChoice from './views/MultipleChoice.svelte';
  import ImageClassification from './views/ImageClassification.svelte';
import ActionSummary from './ActionSummary.svelte';
import type { TreeNode, DecisionNode, PatientHistory } from './types';
import { motion } from '$lib/ui/motion';
import SummaryPanel from './SummaryPanel.svelte';

let { root, history, storageKey = 'otoscopy' } = $props<{
	root: DecisionNode;
	history: PatientHistory;
	storageKey?: string;
}>();

type SummaryState = {
	age?: number;
	durationDays?: number;
	strategy: 'immediate' | 'backup' | null;
	diagnosis: string | null;
	confidence: number | null;
	selections: Record<string, number>;
};

// Navigation state: supports forward/back traversal
let current: TreeNode = $state(root);
const path: string[] = $state([root.id]);
const stack: TreeNode[] = $state([]);
const summary = $state<SummaryState>({
	age: history.age,
	durationDays: history.durationDays,
	strategy: null,
	diagnosis: null,
	confidence: null,
	selections: {}
});

  // Store classifier result for otoscopy node
  let classifierResult: { label: string; confidence: number; diagnosis?: string } | null = $state(null);

  function persist() {
    try {
      localStorage.setItem(`${storageKey}.path`, JSON.stringify(path));
      localStorage.setItem(`${storageKey}.summary`, JSON.stringify(summary));
      localStorage.setItem(`${storageKey}.active`, '1');
    } catch {}
  }

  function tryRestore() {
    try {
      const saved = localStorage.getItem(`${storageKey}.path`);
      if (!saved) return;
      const arr = JSON.parse(saved);
      if (!Array.isArray(arr) || arr.length < 1 || arr[0] !== root.id) return;
      const walk = (start: TreeNode, ids: string[]) => {
        const st: TreeNode[] = [];
        let cur = start;
        const p: string[] = [start.id];
        const findNextById = (node: any, id: string): TreeNode | undefined => {
          if (node?.yes && node.yes.id === id) return node.yes;
          if (node?.no && node.no.id === id) return node.no;
          if (Array.isArray(node?.choices)) {
            for (const c of node.choices) if (c?.next?.id === id) return c.next;
          }
          if (Array.isArray(node?.options)) {
            for (const c of node.options) if (c?.next?.id === id) return c.next;
          }
          if (node?.child && node.child.id === id) return node.child;
          return undefined;
        };
        for (let i = 1; i < ids.length; i++) {
          const next = findNextById(cur as any, ids[i]);
          if (!next) break;
          st.push(cur);
          cur = next;
          p.push(cur.id);
        }
        return { st, cur, p };
      };
      const { st, cur, p } = walk(root, arr);
      if (cur && p && st) {
        current = cur;
        path.splice(0, path.length, ...p);
        stack.splice(0, stack.length, ...st);
      }
      const savedSummary = localStorage.getItem(`${storageKey}.summary`);
      if (savedSummary) {
        const s = JSON.parse(savedSummary);
        Object.assign(summary, s || {});
      }
    } catch {}
  }

  let container: HTMLDivElement | null = null;

  async function go(next: TreeNode | undefined) {
    if (!next) return;
    stack.push(current);
    current = next;
    path.push(next.id);
    // Clear classifier result when moving to next node
    classifierResult = null;
    await tick();
    // Smoothly scroll the active card into view to emphasize downward flow
    container?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    persist();
  }

  async function back() {
    if (!stack.length) return;
    const prev = stack.pop()!;
    if (path.length > 1) path.pop();
    current = prev;
    // Clear classifier result when going back
    classifierResult = null;
    await tick();
    container?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    persist();
  }

  function isYesNo(node: DecisionNode) {
    return !!(node.yes || node.no);
  }

  function hasChoices(node: DecisionNode) {
    return Array.isArray(node.choices) || Array.isArray(node.options);
  }

  // Otoscopy node heuristic: swap to image classification helper
  function isOtoscopy(node: DecisionNode) {
    return node.id?.toLowerCase().includes('otoscopy');
  }

  function isRiskNode(node: DecisionNode) {
    const id = node.id?.toLowerCase() ?? '';
    const title = node.title?.toLowerCase() ?? '';
    return id.includes('complication') || id.includes('risk') || title.includes('high-risk');
  }

  function filterDetailsForAge(details: any) {
    const age = history?.age;
    if (!age || typeof details !== 'object' || details === null || Array.isArray(details)) return details;
    const cutoff = 5;
    if ('olderChildren' in details || 'youngerChildren' in details) {
      if (age < cutoff) {
        const yc = (details as any).youngerChildren ?? [];
        return { youngerChildren: yc };
      } else {
        const oc = (details as any).olderChildren ?? [];
        return { olderChildren: oc };
      }
    }
    return details;
  }

  onMount(() => {
    tryRestore();
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'escape') {
        if (stack.length) {
          e.preventDefault();
          back();
        }
        return;
      }
      if (current.type !== 'decision') return;
      const d = current as DecisionNode;
      if (isYesNo(d)) {
        if (key === 'y' || key === 'enter') {
          e.preventDefault();
          go(d.yes);
        } else if (key === 'n') {
          e.preventDefault();
          go(d.no);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
</script>

  <div class="space-y-6" bind:this={container}>
    <div class="flex items-center justify-between mb-2" in:fly={{ x: motion.fromRightX, duration: motion.durationIn }}>
      <div class="text-xs text-neutral-500">Path: {path.join(' → ')}</div>
      {#if stack.length}
        <button class="btn btn-secondary" onclick={back} aria-label="Go back">← Back</button>
      {/if}
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-[1fr_280px] md:gap-6 items-start">
      <div>
        {#if summary.strategy}
          <div class="mb-3">
            <span class="inline-flex items-center gap-2 rounded-full border border-healthcare-200 bg-healthcare-50 text-healthcare-700 px-3 py-1 text-xs">
              <span class="w-2 h-2 rounded-full bg-healthcare-500"></span>
              Strategy: {summary.strategy === 'immediate' ? 'Immediate antibiotic' : 'Back‑up antibiotic'}
            </span>
          </div>
        {/if}
        {#key current.id}
          {#if current.type === 'decision'}
            {@const decisionNode = current as DecisionNode}
            {#if isOtoscopy(decisionNode)}
              <div class="card p-6 space-y-6" in:fly={{ x: motion.fromRightX, duration: motion.durationIn }}>
                <div>
                  <h3 class="mb-2">{decisionNode.title ?? 'Otoscopic examination (gateway point)'}</h3>
                  <p class="text-sm text-neutral-600 mb-4">Upload an otoscopic image to assist otoscopy assessment.</p>
                  <ImageClassification
                    title=""
                    onResult={(r) => {
                      // Store the result in summary for side panel display
                      classifierResult = r;
                      summary.diagnosis = r.label;
                      summary.confidence = r.confidence;
                      persist();
                    }}
                  />
                </div>
                <div class="border-t border-neutral-200 pt-6">
                  <YesNo
                    question={decisionNode.question}
                    details={filterDetailsForAge(decisionNode.details)}
                    nodeId={decisionNode.id}
                    columns={isRiskNode(decisionNode) ? 3 : 2}
                    onSelections={(e) => {
                      if (!e?.group) return;
                      summary.selections[e.group] = e.total;
                      persist();
                    }}
                    onYes={() => go(decisionNode.yes)}
                    onNo={() => go(decisionNode.no)}
                  />
                </div>
              </div>
            {:else if isYesNo(decisionNode)}
              <div class="card p-6 card-hover" in:fly={{ x: motion.fromRightX, duration: motion.durationIn }}>
                <YesNo
                  question={decisionNode.question}
                  details={filterDetailsForAge(decisionNode.details)}
                  nodeId={decisionNode.id}
                  columns={isRiskNode(decisionNode) ? 3 : 2}
                  onSelections={(e) => {
                    if (!e?.group) return;
                    summary.selections[e.group] = e.total;
                    persist();
                  }}
                  onYes={() => go(decisionNode.yes)}
                  onNo={() => go(decisionNode.no)}
                />
              </div>
            {:else if hasChoices(decisionNode)}
              <MultipleChoice
                prompt={decisionNode.question ?? decisionNode.title ?? 'Choose an option'}
                options={(decisionNode.choices ?? decisionNode.options ?? []).map((o: any, i: number) => ({ label: o.label ?? `Option ${i+1}`, value: String(i) }))}
                onSelect={(v) => {
                  const idx = Number(v);
                  const arr: any[] = (decisionNode.choices ?? decisionNode.options ?? []);
                  const opt = arr[idx];
                  const label = String(opt?.label || '').toLowerCase();
                  if (label.includes('immediate')) summary.strategy = 'immediate';
                  else if (label.includes('back')) summary.strategy = 'backup';
                  const next = opt?.next;
                  go(next);
                }}
              />
            {:else}
              <div class="card p-6" in:fly={{ x: motion.fromRightX, duration: motion.durationIn }}>
                <h3>{decisionNode.title ?? 'Decision'}</h3>
                {#if decisionNode.question}
                <p class="mt-2">{decisionNode.question}</p>
                {/if}
              </div>
            {/if}
          {:else}
            <ActionSummary node={current as any} />
          {/if}
        {/key}
      </div>

      <SummaryPanel summary={summary as any} {path} />
    </div>
  </div>
