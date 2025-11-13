<script lang="ts">
  import { fly } from 'svelte/transition';
  import { motion } from '$lib/ui/motion';

  let { title = 'Image Classification', onResult } = $props<{
    title?: string;
    onResult: (result: { label: string; confidence: number; diagnosis?: string }) => void;
  }>();

  let file: File | null = $state(null);
  let previewUrl: string | null = $state(null);
  let loading = $state(false);
  let error: string | null = $state(null);
  let dragging = $state(false);
  let fileInput: HTMLInputElement | null = $state(null);
  let result: { label: string; confidence: number } | null = $state(null);

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files?.[0]) setFile(input.files[0]);
  }

  async function setFile(f: File) {
    file = f;
    result = null;
    error = null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = file ? URL.createObjectURL(file) : null;

    // Auto-trigger classification
    if (file) {
      await classify();
    }
  }

  function triggerPick() {
    fileInput?.click();
  }

  function reset() {
    file = null;
    result = null;
    error = null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
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
    result = null;
    if (!file) {
      error = 'Please select an image first.';
      return;
    }
    loading = true;
    try {
      const base64Image = await fileToBase64Browser(file);

      // Stage 1: Binary screening only
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

      const classificationResult = {
        label: classification,
        confidence: conf
      };

      // Store result locally for display
      result = classificationResult;

      // Pass to parent
      onResult(classificationResult);
    } catch (e: any) {
      error = e?.message || 'Classification failed. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<div>
  {#if title}
    <h3 class="mb-2">{title}</h3>
    <p class="text-sm text-neutral-600 mb-4">Upload an otoscopic image to assist otoscopy assessment.</p>
  {/if}

  <input
    class="hidden"
    type="file"
    accept="image/*"
    onchange={onFileChange}
    bind:this={fileInput}
  />

  {#if loading}
    <!-- Loading State - Replaces Everything -->
    <div class="rounded-xl border-2 border-blue-300 bg-blue-50 p-12">
      <div class="flex flex-col items-center gap-4 text-center">
        <svg class="animate-spin h-16 w-16 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div class="space-y-2">
          <p class="text-lg font-semibold text-blue-900">Analyzing Image</p>
          <p class="text-sm text-blue-700">Running AI classification...</p>
        </div>
      </div>
    </div>
  {:else if result}
    <!-- Result State - Replaces Everything -->
    <div class="rounded-xl border-2 {result.label === 'pathological' ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'} p-8">
      <div class="space-y-4">
        <!-- Preview Image -->
        {#if previewUrl}
          <div class="flex justify-center">
            <img
              src={previewUrl}
              alt="Classified otoscopic view"
              class="max-h-48 rounded-lg border-2 {result.label === 'pathological' ? 'border-red-300' : 'border-green-300'} shadow-sm"
            />
          </div>
        {/if}

        <!-- Classification Result -->
        <div class="text-center space-y-3">
          <div class="flex items-center justify-center gap-3">
            <svg class="w-8 h-8 {result.label === 'pathological' ? 'text-red-600' : 'text-green-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {#if result.label === 'pathological'}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              {:else}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              {/if}
            </svg>
            <h4 class="text-2xl font-bold {result.label === 'pathological' ? 'text-red-900' : 'text-green-900'}">
              {result.label === 'pathological' ? 'Pathological' : 'Normal'}
            </h4>
          </div>

          <p class="text-lg {result.label === 'pathological' ? 'text-red-800' : 'text-green-800'}">
            Confidence: <strong>{(result.confidence * 100).toFixed(1)}%</strong>
          </p>

          <p class="text-sm {result.label === 'pathological' ? 'text-red-700' : 'text-green-700'}">
            {result.label === 'pathological'
              ? 'AI detected pathology. Please review the clinical signs below and confirm your assessment.'
              : 'AI suggests normal tympanic membrane. Please review and confirm your assessment below.'}
          </p>
        </div>

        <!-- Classify Another Button -->
        <div class="flex justify-center pt-2">
          <button type="button" class="btn btn-primary" onclick={reset}>
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Classify Another Image
          </button>
        </div>
      </div>
    </div>
  {:else}
    <!-- Upload State - Initial -->
    <div
      class={`rounded-xl border-2 bg-white/60 p-8 transition-colors ${dragging ? 'border-solid border-primary-600 bg-primary-50/30' : 'border-dashed border-neutral-300'}`}
      ondragover={onDragOver}
      ondragleave={onDragLeave}
      ondrop={onDrop}
      role="button"
      tabindex="0"
      onclick={triggerPick}
      onkeydown={(e) => e.key === 'Enter' && triggerPick()}
    >
      <div class="flex flex-col items-center gap-3 text-center">
        <svg class="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-neutral-600"><strong>Drag & drop</strong> an image here, or <span class="text-primary-600 underline">click to select</span></p>
        <button
          type="button"
          class="btn btn-primary mt-2"
          onclick={(event) => {
            event.stopPropagation();
            triggerPick();
          }}
        >
          Select Image
        </button>
      </div>
    </div>
  {/if}

  {#if error}
    <div class="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
      <p class="text-sm text-red-600">{error}</p>
    </div>
  {/if}
</div>
