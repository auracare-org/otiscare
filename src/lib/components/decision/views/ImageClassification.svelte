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

  import { env as pubenv } from '$env/dynamic/public';

  const DEFAULT_BINARY = 'https://pytorch-binary-screening-97937849866.us-central1.run.app/predict';
  const DEFAULT_MULTICLASS = 'https://pytorch-multiclass-diagnostic-97937849866.us-central1.run.app/predict';
  const BINARY_ENDPOINT = pubenv.PUBLIC_BINARY_ENDPOINT || DEFAULT_BINARY;
  const MULTICLASS_ENDPOINT = pubenv.PUBLIC_MULTICLASS_ENDPOINT || DEFAULT_MULTICLASS;

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
      const patientId = 'web-client';

      // Stage 1: Binary screening
      const screeningRes = await fetch(BINARY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          patient_id: patientId,
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
      const diagnosisRes = await fetch(MULTICLASS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, patient_id: patientId })
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
  <h3 class="mb-1">{title}</h3>
  <p class="text-sm text-neutral-600">Upload an otoscopic image to assist otoscopy assessment.</p>

  <div class="flex items-center gap-3">
    <input type="file" accept="image/*" on:change={onFileChange} />
    <button class="btn btn-primary" disabled={loading} on:click={classify}>
      {loading ? 'Classifying…' : 'Classify Image'}
    </button>
  </div>

  {#if previewUrl}
    <img src={previewUrl} alt="preview" class="max-h-56 rounded border border-neutral-200" />
  {/if}

  {#if error}
    <p class="text-sm text-red-600">{error}</p>
  {/if}
</div>
