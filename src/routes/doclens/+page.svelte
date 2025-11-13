<script lang="ts">
	import { env as pubenv } from '$env/dynamic/public';
	import { fly } from 'svelte/transition';
	import { motion } from '$lib/ui/motion';

	const BINARY_ENDPOINT = pubenv.PUBLIC_BINARY_ENDPOINT;
	const MULTICLASS_ENDPOINT = pubenv.PUBLIC_MULTICLASS_ENDPOINT;

	let file: File | null = $state(null);
	let previewUrl: string | null = $state(null);
	let loading = $state(false);
	let error: string | null = $state(null);
	let res1: any = $state(null);
	let res2: any = $state(null);
	let enhance = $state(true);
	let dragging = $state(false);
	let lastBase64: string | null = $state(null);
	let fileInput: HTMLInputElement | null = $state(null);
	const pct = (n: number | undefined | null) =>
		typeof n === 'number' && isFinite(n) ? `${Math.round(n * 1000) / 10}%` : '—';
	const ms = (n: number | undefined | null) =>
		typeof n === 'number' && isFinite(n) ? `${Math.round(n * 1000)} ms` : '—';

	function onFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files?.[0]) setFile(input.files[0]);
	}

	function setFile(f: File) {
		file = f;
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = file ? URL.createObjectURL(file) : null;
		if (file) classify();
	}

	function triggerPick() {
		fileInput?.click();
	}

	function clearAll() {
		file = null;
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = null;
		res1 = res2 = null;
		error = null;
		lastBase64 = null;
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
		dragging = true;
	}
	function onDragLeave(e: DragEvent) {
		e.preventDefault();
		dragging = false;
	}
	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		const f = e.dataTransfer?.files?.[0];
		if (f) setFile(f);
	}

	function fileToBase64Browser(file: File) {
		return new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const result = String(reader.result || '');
				const base64 = result.includes(',') ? result.split(',')[1] : result;
				resolve(base64);
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	async function classify() {
		if (!file) return;
		error = null;
		res1 = res2 = null;
		loading = true;
		try {
			const base64Image = await fileToBase64Browser(file);
			lastBase64 = base64Image;
			const payload = { image: base64Image };

			// Stage 1: Binary screening
			const r1 = await fetch('/api/infer?stage=binary', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...payload, apply_medical_enhancement: enhance })
			}).then((r) => r.json());
			res1 = r1;

			// Stage 2: Only call if pathological
			let r2 = null;
			if (r1?.prediction?.classification === 'pathological') {
				r2 = await fetch('/api/infer?stage=multiclass', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				}).then((r) => r.json());
			}
			res2 = r2;
		} catch (e: any) {
			error = e?.message || 'Request failed';
		} finally {
			loading = false;
		}
	}

	function downloadSession() {
		const payload = {
			createdAt: new Date().toISOString(),
			enhancement: enhance,
			endpoints: { binary: BINARY_ENDPOINT, multiclass: MULTICLASS_ENDPOINT },
			results: { stage1: res1, stage2: res2 },
			image: file ? { name: file.name, type: file.type, size: file.size, base64: lastBase64 } : null
		};
		const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = `doclens-session-${Date.now()}.json`;
		a.click();
		URL.revokeObjectURL(a.href);
	}

	function copySummary() {
		const lines: string[] = [];
		if (res1?.prediction) {
			lines.push(
				`Stage 1: ${res1.prediction.classification} (${pct(res1.prediction.confidence)})` +
					(res1?.prediction?.requires_stage2 !== undefined
						? ` | requires_stage2: ${String(res1.prediction.requires_stage2)}`
						: '')
			);
		}
		if (res2?.prediction) {
			lines.push(`Stage 2: ${res2.prediction.diagnosis} (${pct(res2.prediction.confidence)})`);
		}
		if (!lines.length) return;
		navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
	}

	function downloadCSV() {
		const probs: Record<string, number> | undefined = res2?.prediction?.probabilities;
		if (!probs) return;
		const header = 'label,probability,percent';
		const rows = Object.entries(probs)
			.sort((a, b) => (b[1] as number) - (a[1] as number))
			.map(([label, val]) => `${label},${val},${Math.round((val as number) * 1000) / 10}%`);
		const csv = [header, ...rows].join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = `doclens-probabilities-${Date.now()}.csv`;
		a.click();
		URL.revokeObjectURL(a.href);
	}
</script>

<section class="container mx-auto max-w-5xl px-4 overflow-y-auto" style="height: calc(100vh - 3.5rem); padding-top: 1.5rem; padding-bottom: 1.5rem;">
	<div
		class="flex items-start gap-6"
		in:fly={{ x: motion.fromRightX, duration: motion.durationIn }}
	>
		<div class="flex-1">
			<div class="card p-6">
				<h1 class="mb-2 text-center">DocLens</h1>
				<p class="mb-4 text-center text-neutral-700">Upload an otoscopic image to run both endpoints.</p>
					{#if !file}
						<div
							class={`rounded-xl border-2 bg-white/60 p-6 mt-2 ${dragging ? 'border-solid border-primary-600' : 'border-dashed'}`}
							ondragover={onDragOver}
							ondragleave={onDragLeave}
							ondrop={onDrop}
							role="button"
							tabindex="0"
							aria-label="Upload an otoscopic image"
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									triggerPick();
								}
							}}
						>
							<div class="flex flex-col items-center gap-3">
								<input
									class="hidden"
									type="file"
									accept="image/*"
									onchange={onFileChange}
									bind:this={fileInput}
								/>
								<div
									class="flex flex-col items-center gap-3 text-neutral-600"
									onclick={triggerPick}
									role="button"
									aria-label="Select image"
									tabindex="0"
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											triggerPick();
										}
									}}
								>
									<p><strong>Drag & drop</strong> an image here, or <span class="underline">click to select</span></p>
									<button type="button" class="btn btn-healthcare">Select image</button>
								</div>
								<label class="flex items-center gap-2 text-sm text-neutral-700">
									<input type="checkbox" bind:checked={enhance} /> Apply medical enhancement (Stage 1)
								</label>
								{#if error}
									<p class="text-sm text-red-600">{error}</p>
								{/if}
								{#if loading}
									<p class="text-sm text-neutral-600">Running…</p>
								{/if}
							</div>
						</div>
					{:else}
						<div
							class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-100 bg-white/70 p-3 mt-2"
						>
							<div class="flex items-center gap-3">
								{#if previewUrl}
									<img
										src={previewUrl}
										alt="thumbnail"
										class="h-14 w-14 rounded border border-neutral-200 object-cover"
									/>
								{/if}
								<div>
									<div class="font-medium text-neutral-800">{file?.name}</div>
									<div class="text-xs text-neutral-500">
										{Math.round((file?.size || 0) / 1024)} KB · {file?.type || 'image'}
									</div>
								</div>
							</div>
							<div class="flex flex-wrap items-center gap-2">
								<label class="flex items-center gap-2 text-sm text-neutral-700">
									<input type="checkbox" bind:checked={enhance} /> Enhancement (Stage 1)
								</label>
								<button class="btn btn-secondary" onclick={triggerPick}>Change image</button>
								<button class="btn btn-healthcare" onclick={classify} disabled={loading}
									>{loading ? 'Running…' : 'Run again'}</button
								>
								<button class="btn btn-secondary" onclick={downloadSession}>Save session</button>
								<button class="btn btn-secondary" onclick={clearAll}>Clear</button>
							</div>
							<input
								class="hidden"
								type="file"
								accept="image/*"
								onchange={onFileChange}
								bind:this={fileInput}
							/>
						</div>
					{/if}
			</div>

			{#if res1 || res2}
				<div class="mt-4 mb-3 card p-3">
					<div class="flex flex-wrap items-center justify-between gap-2">
						<div class="flex flex-wrap items-center gap-2">
							{#if res1?.prediction}
								<span
									class={`rounded px-2 py-1 text-xs font-medium ${res1?.prediction?.classification === 'pathological' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}
								>
									Stage 1: {res1?.prediction?.classification} ({pct(res1?.prediction?.confidence)})
								</span>
							{/if}
							{#if res2?.prediction && res1?.prediction?.classification === 'pathological'}
								<span
									class="rounded bg-healthcare-100 px-2 py-1 text-xs font-medium text-healthcare-700"
								>
									Stage 2: {res2?.prediction?.diagnosis?.replaceAll('_', ' ')} ({pct(
										res2?.prediction?.confidence
									)})
								</span>
							{/if}
						</div>
						<div class="flex items-center gap-2">
							<button class="btn btn-secondary" onclick={copySummary}>Copy summary</button>
							{#if res2?.prediction?.probabilities}
								<button class="btn btn-secondary" onclick={downloadCSV}>Export CSV</button>
							{/if}
						</div>
					</div>
				</div>

				<div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
					{#if previewUrl}
						<div class="flex flex-col items-center justify-start card p-3">
							<div class="mb-2 font-medium">Uploaded Image</div>
							<img
								src={previewUrl}
								alt="uploaded"
								class="max-h-80 rounded border border-neutral-200"
							/>
						</div>
					{/if}
					<div class="grid grid-cols-1 gap-3 md:col-span-2 md:grid-cols-2">
						<div class="space-y-2 card p-4">
							<h3 class="mb-1">Stage 1 — Binary Screening</h3>
							{#if res1}
								<div class="mt-2 flex flex-wrap gap-2">
									<span
										class={`rounded px-2 py-1 text-xs font-medium ${res1?.prediction?.classification === 'pathological' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}
									>
										{res1?.prediction?.classification || '—'}
									</span>
									<span
										class="rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700"
										>Confidence: {pct(res1?.prediction?.confidence)}</span
									>
									{#if res1?.prediction?.classification === 'pathological' && res1?.prediction?.requires_stage2 !== undefined}
										<span
											class="rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700"
											>Requires stage 2: {String(res1?.prediction?.requires_stage2)}</span
										>
									{/if}
								</div>
								{#if res1?.clinical_recommendation}
									<p class="text-sm text-neutral-700">
										<strong>Recommendation:</strong>
										{res1.clinical_recommendation}
									</p>
								{/if}
								<div class="grid grid-cols-3 gap-2 text-xs text-neutral-700">
									<div class="rounded bg-neutral-100 p-2">
										<div class="font-medium">Preprocess</div>
										{ms(res1?.performance?.preprocessing_time)}
									</div>
									<div class="rounded bg-neutral-100 p-2">
										<div class="font-medium">Inference</div>
										{ms(res1?.performance?.inference_time)}
									</div>
									<div class="rounded bg-neutral-100 p-2">
										<div class="font-medium">Total</div>
										{ms(res1?.performance?.total_time)}
									</div>
								</div>
								<details class="mt-2">
									<summary class="cursor-pointer text-sm text-neutral-600">Raw JSON</summary>
									<pre class="overflow-auto rounded bg-neutral-100 p-2 text-xs">{JSON.stringify(
											res1,
											null,
											2
										)}</pre>
								</details>
							{:else}
								<p class="text-sm text-neutral-500">No response.</p>
							{/if}
						</div>
						{#if res1?.prediction?.classification === 'pathological'}
						<div class="space-y-2 card p-4">
							<h3 class="mb-1">Stage 2 — Multiclass Diagnostic</h3>
							{#if res2}
								<div class="mt-2 flex flex-wrap gap-2">
									<span
										class="rounded bg-healthcare-100 px-2 py-1 text-xs font-medium text-healthcare-700"
										>{res2?.prediction?.diagnosis || '—'}</span
									>
									<span
										class="rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700"
										>Confidence: {pct(res2?.prediction?.confidence)}</span
									>
								</div>
								{#if res2?.prediction?.probabilities}
									<div class="mt-1 space-y-2">
										{#each Object.entries(res2.prediction.probabilities).sort((a, b) => (b[1] as number) - (a[1] as number)) as [label, val]}
											<div class="text-xs text-neutral-700">{label.replaceAll('_', ' ')}</div>
											<div class="h-2 rounded bg-neutral-100">
												<div
													class="h-2 rounded gradient-primary"
													style={`width:${Math.min(100, Math.max(0, Math.round((val as number) * 100)))}%`}
												></div>
											</div>
										{/each}
									</div>
								{/if}
								<div class="mt-2 grid grid-cols-3 gap-2 text-xs text-neutral-700">
									<div class="rounded bg-neutral-100 p-2">
										<div class="font-medium">Preprocess</div>
										{ms(res2?.performance?.preprocessing_time)}
									</div>
									<div class="rounded bg-neutral-100 p-2">
										<div class="font-medium">Inference</div>
										{ms(res2?.performance?.inference_time)}
									</div>
									<div class="rounded bg-neutral-100 p-2">
										<div class="font-medium">Total</div>
										{ms(res2?.performance?.total_time)}
									</div>
								</div>
								<details class="mt-2">
									<summary class="cursor-pointer text-sm text-neutral-600">Raw JSON</summary>
									<pre class="overflow-auto rounded bg-neutral-100 p-2 text-xs">{JSON.stringify(
											res2,
											null,
											2
										)}</pre>
								</details>
							{:else}
								<p class="text-sm text-neutral-500">No response.</p>
							{/if}
						</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>
