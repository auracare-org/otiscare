<script lang="ts">
  import { fly } from 'svelte/transition';
  import { motion } from '$lib/ui/motion';

  let { title = 'Image Classification', onResult } = $props<{
    title?: string;
    onResult: (result: { label: string; confidence: number; diagnosis?: string }) => void;
  }>();

  let file: File | null = null;
  let previewUrl: string | null = null;
  let loading = $state(false);
  let error: string | null = $state(null);
  let dragging = $state(false);
  let fileInput: HTMLInputElement | null = null;

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files?.[0]) setFile(input.files[0]);
  }

  function setFile(f: File) {
    file = f;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = file ? URL.createObjectURL(file) : null;
  }

  function triggerPick() {
    fileInput?.click();
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
    error = null;
    if (!file) {
      error = 'Please select an image first.';
      return;
    }
    loading = true;
    try {
      const base64Image = await fileToBase64Browser(file);

      // Stage 1: Binary screening
      const screeningRes = await fetch('/api/infer?stage=binary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          apply_medical_enhancement: true
        })
      });
      const screening = await screeningRes.json();
      if (!screening.success || !screening.prediction) throw new Error('Screening failed');

      const classification = screening.prediction.classification;
      const conf = Number(screening.prediction.confidence ?? 0);

      if (classification === 'normal') {
        onResult({ label: 'normal', confidence: conf });
        return;
      }

      // Stage 2: Multiclass diagnosis
      const diagnosisRes = await fetch('/api/infer?stage=multiclass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });
      const diagnosis = await diagnosisRes.json();
      if (!diagnosis.success || !diagnosis.prediction) throw new Error('Diagnosis failed');

      onResult({
        label: 'pathological',
        confidence: Number(diagnosis.prediction.confidence ?? conf),
        diagnosis: String(diagnosis.prediction.diagnosis || 'pathology')
      });
    } catch (e: any) {
      error = e?.message || 'Classification failed. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="card p-6" in:fly={{ x: motion.fromRightX, duration: motion.durationIn }}>
  <h3 class="mb-2">{title}</h3>
  <p class="text-sm text-neutral-600 mb-4">Upload an otoscopic image to assist otoscopy assessment.</p>

  {#if !file}
    <div
      class={`rounded-xl border-2 bg-white/60 p-8 transition-colors ${dragging ? 'border-solid border-primary-600 bg-primary-50/30' : 'border-dashed border-neutral-300'}`}
      on:dragover={onDragOver}
      on:dragleave={onDragLeave}
      on:drop={onDrop}
      role="button"
      tabindex="0"
      on:click={triggerPick}
      on:keydown={(e) => e.key === 'Enter' && triggerPick()}
    >
      <div class="flex flex-col items-center gap-3 text-center">
        <input
          class="hidden"
          type="file"
          accept="image/*"
          on:change={onFileChange}
          bind:this={fileInput}
        />
        <svg class="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-neutral-600"><strong>Drag & drop</strong> an image here, or <span class="text-primary-600 underline">click to select</span></p>
        <button type="button" class="btn btn-primary mt-2" on:click|stopPropagation={triggerPick}>Select Image</button>
      </div>
    </div>
  {:else}
    <div class="rounded-lg border border-neutral-200 bg-white/70 p-4 space-y-4">
      <div class="flex items-center gap-3">
        {#if previewUrl}
          <img
            src={previewUrl}
            alt="thumbnail"
            class="h-16 w-16 rounded border border-neutral-200 object-cover flex-shrink-0"
          />
        {/if}
        <div class="flex-1 min-w-0">
          <div class="font-medium text-neutral-800 truncate">{file?.name}</div>
          <div class="text-xs text-neutral-500">
            {Math.round((file?.size || 0) / 1024)} KB
          </div>
        </div>
        <button type="button" class="btn btn-secondary" on:click={triggerPick}>Change</button>
        <input
          class="hidden"
          type="file"
          accept="image/*"
          on:change={onFileChange}
          bind:this={fileInput}
        />
      </div>
      <button class="btn btn-primary w-full" disabled={loading} on:click={classify}>
        {loading ? 'Classifying…' : 'Classify Image'}
      </button>
    </div>
  {/if}

  {#if error}
    <div class="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
      <p class="text-sm text-red-600">{error}</p>
    </div>
  {/if}
</div>
