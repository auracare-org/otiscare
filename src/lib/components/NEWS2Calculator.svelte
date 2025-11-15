<script lang="ts">
	import {
		calculateNEWS2,
		getRiskColorClass,
		type NEWS2Parameters,
		type NEWS2Result,
		type OxygenScale,
		type ConsciousnessLevel
	} from '$lib/utils/news2';

	let respiratoryRate = $state(16);
	let oxygenSaturation = $state(98);
	let oxygenScale: OxygenScale = $state('scale1');
	let supplementalOxygen = $state(false);
	let temperature = $state(37.0);
	let systolicBP = $state(120);
	let heartRate = $state(75);
	let consciousness: ConsciousnessLevel = $state('alert');

	let result: NEWS2Result = $derived(
		calculateNEWS2({
			respiratoryRate,
			oxygenSaturation,
			oxygenScale,
			supplementalOxygen,
			temperature,
			systolicBP,
			heartRate,
			consciousness
		})
	);

	function reset() {
		respiratoryRate = 16;
		oxygenSaturation = 98;
		oxygenScale = 'scale1';
		supplementalOxygen = false;
		temperature = 37.0;
		systolicBP = 120;
		heartRate = 75;
		consciousness = 'alert';
	}
</script>

<div class="card p-6 space-y-6">
	<div class="space-y-2">
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-semibold">NEWS2 Score Calculator</h2>
			<button class="btn btn-secondary text-sm" onclick={reset}>Reset</button>
		</div>
		<p class="text-sm text-neutral-600">
			National Early Warning Score 2 for identifying acutely ill patients requiring escalation
		</p>
	</div>

	<div class="grid gap-6 md:grid-cols-2">
		<!-- Left column: Input parameters -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold text-neutral-800">Vital Signs</h3>

			<!-- Respiratory Rate -->
			<div class="space-y-2">
				<label for="resp-rate" class="block text-sm font-medium text-neutral-700">
					Respiratory Rate (breaths/min)
				</label>
				<input
					id="resp-rate"
					type="number"
					min="0"
					max="60"
					bind:value={respiratoryRate}
					class="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
				/>
				<div class="text-xs text-neutral-500">Score: {result.breakdown.respiratoryRate}</div>
			</div>

			<!-- Oxygen Saturation -->
			<div class="space-y-2">
				<label for="spo2" class="block text-sm font-medium text-neutral-700">
					Oxygen Saturation (SpO₂ %)
				</label>
				<input
					id="spo2"
					type="number"
					min="50"
					max="100"
					bind:value={oxygenSaturation}
					class="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
				/>
				<div class="text-xs text-neutral-500">Score: {result.breakdown.oxygenSaturation}</div>
			</div>

			<!-- Oxygen Scale Selection -->
			<div class="space-y-2">
				<label class="block text-sm font-medium text-neutral-700">Oxygen Scale</label>
				<div class="flex gap-4">
					<label class="flex items-center gap-2">
						<input
							type="radio"
							name="scale"
							value="scale1"
							bind:group={oxygenScale}
							class="text-primary-600"
						/>
						<span class="text-sm">Scale 1 (Standard)</span>
					</label>
					<label class="flex items-center gap-2">
						<input
							type="radio"
							name="scale"
							value="scale2"
							bind:group={oxygenScale}
							class="text-primary-600"
						/>
						<span class="text-sm">Scale 2 (Hypercapnic)</span>
					</label>
				</div>
			</div>

			<!-- Supplemental Oxygen -->
			<div class="space-y-2">
				<label class="flex items-center gap-2">
					<input type="checkbox" bind:checked={supplementalOxygen} class="text-primary-600" />
					<span class="text-sm font-medium text-neutral-700">Supplemental Oxygen</span>
				</label>
				<div class="text-xs text-neutral-500">Score: {result.breakdown.supplementalOxygen}</div>
			</div>

			<!-- Temperature -->
			<div class="space-y-2">
				<label for="temp" class="block text-sm font-medium text-neutral-700">
					Temperature (°C)
				</label>
				<input
					id="temp"
					type="number"
					min="30"
					max="45"
					step="0.1"
					bind:value={temperature}
					class="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
				/>
				<div class="text-xs text-neutral-500">Score: {result.breakdown.temperature}</div>
			</div>

			<!-- Systolic BP -->
			<div class="space-y-2">
				<label for="bp" class="block text-sm font-medium text-neutral-700">
					Systolic Blood Pressure (mmHg)
				</label>
				<input
					id="bp"
					type="number"
					min="50"
					max="300"
					bind:value={systolicBP}
					class="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
				/>
				<div class="text-xs text-neutral-500">Score: {result.breakdown.systolicBP}</div>
			</div>

			<!-- Heart Rate -->
			<div class="space-y-2">
				<label for="hr" class="block text-sm font-medium text-neutral-700">
					Heart Rate (beats/min)
				</label>
				<input
					id="hr"
					type="number"
					min="20"
					max="250"
					bind:value={heartRate}
					class="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
				/>
				<div class="text-xs text-neutral-500">Score: {result.breakdown.heartRate}</div>
			</div>

			<!-- Consciousness -->
			<div class="space-y-2">
				<label class="block text-sm font-medium text-neutral-700">Consciousness Level</label>
				<div class="flex gap-4">
					<label class="flex items-center gap-2">
						<input
							type="radio"
							name="consciousness"
							value="alert"
							bind:group={consciousness}
							class="text-primary-600"
						/>
						<span class="text-sm">Alert</span>
					</label>
					<label class="flex items-center gap-2">
						<input
							type="radio"
							name="consciousness"
							value="cvpu"
							bind:group={consciousness}
							class="text-primary-600"
						/>
						<span class="text-sm">CVPU</span>
					</label>
				</div>
				<div class="text-xs text-neutral-500">
					Score: {result.breakdown.consciousness} (CVPU = Confusion, Voice, Pain, Unresponsive)
				</div>
			</div>
		</div>

		<!-- Right column: Results -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold text-neutral-800">Results</h3>

			<!-- Total Score -->
			<div class="rounded-xl border-2 {getRiskColorClass(result.clinicalRisk)} p-6 text-center">
				<div class="text-sm font-medium uppercase tracking-wide opacity-75">Total NEWS2 Score</div>
				<div class="mt-2 text-6xl font-bold">{result.totalScore}</div>
				<div class="mt-3 text-sm font-semibold uppercase tracking-wide">
					{result.clinicalRisk} Risk
				</div>
			</div>

			<!-- Clinical Response -->
			<div class="rounded-lg bg-neutral-50 p-4 space-y-2">
				<h4 class="text-sm font-semibold text-neutral-800">Clinical Response</h4>
				<p class="text-sm text-neutral-700">{result.clinicalResponse}</p>
			</div>

			<!-- Score Breakdown -->
			<div class="rounded-lg bg-neutral-50 p-4 space-y-3">
				<h4 class="text-sm font-semibold text-neutral-800">Score Breakdown</h4>
				<div class="space-y-2 text-xs">
					<div class="flex justify-between">
						<span class="text-neutral-600">Respiratory Rate</span>
						<span class="font-semibold">{result.breakdown.respiratoryRate}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-neutral-600">Oxygen Saturation</span>
						<span class="font-semibold">{result.breakdown.oxygenSaturation}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-neutral-600">Supplemental Oxygen</span>
						<span class="font-semibold">{result.breakdown.supplementalOxygen}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-neutral-600">Temperature</span>
						<span class="font-semibold">{result.breakdown.temperature}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-neutral-600">Systolic BP</span>
						<span class="font-semibold">{result.breakdown.systolicBP}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-neutral-600">Heart Rate</span>
						<span class="font-semibold">{result.breakdown.heartRate}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-neutral-600">Consciousness</span>
						<span class="font-semibold">{result.breakdown.consciousness}</span>
					</div>
					<div class="border-t border-neutral-200 pt-2 flex justify-between font-bold">
						<span>Total</span>
						<span>{result.totalScore}</span>
					</div>
				</div>
			</div>

			<!-- Clinical Risk Thresholds -->
			<div class="rounded-lg bg-neutral-50 p-4 space-y-2">
				<h4 class="text-sm font-semibold text-neutral-800">Risk Thresholds</h4>
				<div class="space-y-1 text-xs text-neutral-600">
					<div class="flex items-center gap-2">
						<div class="w-3 h-3 rounded-full bg-success-500"></div>
						<span><strong>Low:</strong> 0-4 points</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="w-3 h-3 rounded-full bg-amber-500"></div>
						<span><strong>Medium:</strong> 5-6 points</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="w-3 h-3 rounded-full bg-red-500"></div>
						<span><strong>High:</strong> 7+ points</span>
					</div>
					<p class="pt-2 text-neutral-500 italic">
						Note: Any single parameter scoring 3 triggers urgent response
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
