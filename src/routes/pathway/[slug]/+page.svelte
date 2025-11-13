<script lang="ts">
	import AgeDurationForm from '$lib/components/decision/AgeDurationForm.svelte';
	import DecisionTree from '$lib/components/decision/DecisionTree.svelte';
	import PathwayFooter from '$lib/components/decision/PathwayFooter.svelte';
	import type { PatientHistory as PH, DecisionNode, TreeNode } from '$lib/components/decision/types';
	import { fly } from 'svelte/transition';
	import { motion } from '$lib/ui/motion';
	import { onMount } from 'svelte';

	const props = $props<{
		data: {
			definition: {
				slug: string;
				title: string;
				subtitle: string;
				ageRange: string;
				setting: string;
				summaryPoints?: string[];
			};
			pathway: any;
		};
	}>();

	const { definition, pathway } = props.data;
	const root: DecisionNode = pathway.decisionTree;
	const notes: string[] = pathway.notes ?? [];
	const metadata = pathway.metadata ?? {};
	const asDecision = (node: TreeNode | null | undefined): DecisionNode | null =>
		node && node.type === 'decision' ? (node as DecisionNode) : null;
	const symptomNode = asDecision(root?.no ?? null);
	const startDetails = (symptomNode?.details ?? {}) as Record<string, unknown>;
	const riskFactorsRaw = (startDetails as Record<string, unknown> & { riskFactors?: unknown }).riskFactors;
	const riskFactors = Array.isArray(riskFactorsRaw) ? (riskFactorsRaw as string[]) : [];
	const redFlagRaw = (root?.details as Record<string, unknown> & { redFlagSymptoms?: unknown })?.redFlagSymptoms;
	const redFlagSymptoms = Array.isArray(redFlagRaw) ? (redFlagRaw as string[]) : [];

	type Step = 'landing' | 'age' | 'tree';
	let step: Step = $state('landing');
	let history: PH = $state({});
	const storagePrefix = `otoscopy.${definition.slug}`;

	function handleStart() {
		step = 'age';
		try {
			localStorage.setItem(`${storagePrefix}.step`, 'age');
		} catch {}
	}

	function handleAgeSubmit(partial: Pick<PH, 'age' | 'durationDays'>) {
		history = { ...history, ...partial };
		step = 'tree';
		try {
			localStorage.setItem(`${storagePrefix}.history`, JSON.stringify(history));
			localStorage.setItem(`${storagePrefix}.step`, 'tree');
		} catch {}
	}

	function handleStartOver() {
		history = {} as PH;
		step = 'landing';
		try {
			localStorage.removeItem(`${storagePrefix}.step`);
			localStorage.removeItem(`${storagePrefix}.history`);
			localStorage.removeItem(`${storagePrefix}.path`);
			localStorage.removeItem(`${storagePrefix}.summary`);
			localStorage.removeItem(`${storagePrefix}.active`);
		} catch {}
	}

	function exportSummary() {
		if (typeof window !== 'undefined') {
			window.print();
		}
	}

	onMount(() => {
		try {
			const savedHistory = localStorage.getItem(`${storagePrefix}.history`);
			const savedPath = localStorage.getItem(`${storagePrefix}.path`);
			if (savedHistory) history = JSON.parse(savedHistory);
			if (savedPath) {
				const arr = JSON.parse(savedPath);
				if (Array.isArray(arr) && arr.length > 1 && arr[0] === root.id) {
					step = 'tree';
					localStorage.setItem(`${storagePrefix}.step`, 'tree');
					return;
				}
			}
			const savedStep = localStorage.getItem(`${storagePrefix}.step`);
			if (savedStep === 'age') step = 'age';
			else if (savedStep === 'tree') step = 'tree';
		} catch {}
	});
</script>

<section class="flex flex-col" style="min-height: calc(100vh - 3.5rem);">
	<div class="flex flex-1 items-center justify-center px-6 py-4 overflow-y-auto">
		{#if step === 'landing'}
			<div class="w-full max-w-5xl space-y-6" in:fly={{ x: motion.fromRightX, duration: motion.durationIn }}>
				<section class="rounded-3xl bg-gradient-to-br from-healthcare-50 via-white to-white p-8 shadow-lg">
					<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div class="space-y-3">
							<p class="text-sm uppercase tracking-wide text-healthcare-600 font-semibold">
								{definition.subtitle}
							</p>
							<h1 class="text-4xl font-bold text-neutral-900">{definition.title}</h1>
							<p class="text-lg text-neutral-700 max-w-2xl">
								Evidence-based pathway for {definition.ageRange.toLowerCase()} across {definition.setting}.
								Tap start to capture history, otoscopy, risk cues, and shared decision status.
							</p>
						</div>
						<div class="flex flex-col gap-2 text-sm text-neutral-600">
							<span class="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 font-medium shadow-sm">
								<span class="w-2 h-2 rounded-full bg-healthcare-500"></span>
								{definition.ageRange}
							</span>
							<span class="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 font-medium shadow-sm">
								<span class="w-2 h-2 rounded-full bg-primary-500"></span>
								{definition.setting}
							</span>
						</div>
					</div>
					{#if definition.summaryPoints?.length}
						<ul class="mt-4 list-disc pl-5 text-sm text-neutral-600 space-y-1">
							{#each definition.summaryPoints as point (point)}
								<li>{point}</li>
							{/each}
						</ul>
					{/if}
					<div class="mt-6 flex flex-wrap gap-3">
						<button class="btn btn-healthcare btn-lg" onclick={handleStart}>Start Assessment</button>
						<a class="btn btn-secondary" href="/sources">View Sources</a>
					</div>
				</section>
				<section class="grid gap-4 md:grid-cols-2">
					<article class="card p-5 space-y-3 md:col-span-2">
						<h3 class="text-lg font-semibold text-red-700">Escalate urgently if…</h3>
						{#if redFlagSymptoms.length}
							<div class="grid gap-2 sm:grid-cols-2">
								{#each redFlagSymptoms.slice(0, 8) as flag (flag)}
									<div class="rounded-lg border border-red-100 bg-red-50/60 px-3 py-2 text-sm text-red-900">
										{flag}
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-neutral-600">
								The workflow highlights red flag symptoms once you reach the complication screen.
							</p>
						{/if}
						<p class="text-sm text-neutral-600 pt-2">
							<a
								class="text-primary-600 underline"
								href="https://www.mdcalc.com/calc/10083/national-early-warning-score-news-2"
								target="_blank"
								rel="noreferrer"
							>
								Open the NEWS2 calculator
							</a>
							before signposting to emergency care.
						</p>
					</article>
					<article class="card p-5 space-y-3">
						<h3 class="text-lg font-semibold">What you'll capture</h3>
						<ul class="list-disc pl-5 text-sm text-neutral-700">
							<li>Age + symptom duration</li>
							<li>Otoscopy appearance and drainage</li>
							<li>Systemic severity and bilateral disease cues</li>
							<li>Risk modifiers (immunosuppression, prematurity, allergy)</li>
							<li>Shared decision plan (immediate vs back-up antibiotics)</li>
						</ul>
					</article>
					<article class="card p-5 space-y-3">
						<h3 class="text-lg font-semibold">Before you begin</h3>
						<ul class="list-disc pl-5 text-sm text-neutral-700">
							<li>Have otoscopy findings or images ready.</li>
							<li>Confirm allergy history and temperature.</li>
							<li>Document analgesia given and pain score.</li>
							<li>Be prepared to discuss home care (warm compresses, upright feeds, smoke avoidance).</li>
						</ul>
					</article>
				</section>
			</div>
		{:else if step === 'age'}
			<AgeDurationForm onSubmit={handleAgeSubmit} />
		{:else}
			<div class="w-full max-w-5xl" in:fly={{ x: motion.fromRightX, duration: motion.durationIn }}>
				<DecisionTree {root} {history} storageKey={storagePrefix} />
			</div>
		{/if}
	</div>
	{#if step !== 'landing'}
		<div class="container mx-auto px-4 py-3">
			<div class="flex flex-wrap items-center justify-end gap-3">
				{#if step === 'tree'}
					<button class="btn btn-secondary" onclick={exportSummary}>Export PDF summary</button>
				{/if}
				<button class="btn btn-secondary" onclick={handleStartOver}>Start Over</button>
			</div>
		</div>
	{/if}
	<div class="w-full">
		<PathwayFooter {metadata} />
	</div>
</section>
