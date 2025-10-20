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

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    file = input.files?.[0] ?? null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = file ? URL.createObjectURL(file) : null;
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

<div class="card p-6 space-y-4" in:fly={{ x: motion.fromRightX, duration: motion.durationIn }}>
  <h3 class="mb-2">{title}</h3>
  <p class="text-sm text-neutral-600 mb-4">Upload an otoscopic image to assist otoscopy assessment.</p>

  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
    <input type="file" accept="image/*" on:change={onFileChange} class="w-full sm:w-auto" />
    <button class="btn btn-primary w-full sm:w-auto" disabled={loading} on:click={classify}>
      {loading ? 'Classifying…' : 'Classify Image'}
    </button>
  </div>

  {#if previewUrl}
    <div class="mt-4">
      <img src={previewUrl} alt="preview" class="max-h-56 rounded border border-neutral-200 mx-auto" />
    </div>
  {/if}

  {#if error}
    <div class="mt-4">
      <p class="text-sm text-red-600">{error}</p>
    </div>
  {/if}
</div>
