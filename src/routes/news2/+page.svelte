<script lang="ts">
	import NEWS2Calculator from '$lib/components/NEWS2Calculator.svelte';
</script>

<svelte:head>
	<title>NEWS2 Calculator | Otoscopy</title>
	<meta
		name="description"
		content="National Early Warning Score 2 calculator for identifying acutely ill patients requiring escalation"
	/>
</svelte:head>

<section class="min-h-[calc(100vh-3.5rem)] bg-secondary-50 py-10 px-4">
	<div class="mx-auto max-w-6xl space-y-8">
		<header class="rounded-3xl bg-white p-8 shadow-lg">
			<p class="text-sm uppercase tracking-wide text-healthcare-600 font-semibold">
				Clinical Assessment Tool
			</p>
			<h1 class="text-4xl font-bold text-neutral-900 mt-2">NEWS2 Score Calculator</h1>
			<p class="mt-3 text-neutral-700 max-w-3xl">
				The National Early Warning Score (NEWS) 2 is a standardised assessment tool for identifying
				acutely ill patients who require urgent clinical intervention. This calculator helps
				determine the appropriate level of clinical response based on physiological parameters.
			</p>
		</header>

		<NEWS2Calculator />

		<div class="grid gap-4 md:grid-cols-2">
			<article class="card p-5 space-y-3">
				<h3 class="text-lg font-semibold">About NEWS2</h3>
				<p class="text-sm text-neutral-700">
					NEWS2 was developed by the Royal College of Physicians to improve detection and response
					to acute illness. It uses seven physiological parameters to generate a score that
					correlates with clinical risk and guides escalation decisions.
				</p>
				<p class="text-sm text-neutral-700">
					The system is endorsed by NHS England and is used widely across acute care pathways in
					hospitals and community settings.
				</p>
			</article>

			<article class="card p-5 space-y-3">
				<h3 class="text-lg font-semibold">Clinical Response Guidelines</h3>
				<ul class="list-disc pl-5 text-sm text-neutral-700 space-y-2">
					<li>
						<strong>Score 0:</strong> Continue routine monitoring (minimum 12-hourly observations)
					</li>
					<li>
						<strong>Score 1-4:</strong> Monitor frequency at least 12-hourly, inform registered nurse
					</li>
					<li>
						<strong>Score 5-6:</strong> Urgent review by clinician with acute illness competencies
					</li>
					<li>
						<strong>Score 7+:</strong> Emergency assessment and usually transfer to higher level of care
					</li>
					<li>
						<strong>Any parameter = 3:</strong> Triggers urgent clinical review even if total score
						is low
					</li>
				</ul>
			</article>

			<article class="card p-5 space-y-3">
				<h3 class="text-lg font-semibold">Oxygen Scale Selection</h3>
				<p class="text-sm text-neutral-700">
					<strong>Scale 1 (Standard):</strong> Use for most patients without chronic respiratory conditions
					requiring oxygen therapy.
				</p>
				<p class="text-sm text-neutral-700">
					<strong>Scale 2 (Hypercapnic):</strong> Use for patients with hypercapnic respiratory failure
					(typically COPD patients on long-term oxygen therapy). These patients have different oxygen
					saturation targets.
				</p>
			</article>

			<article class="card p-5 space-y-3">
				<h3 class="text-lg font-semibold">Important Notes</h3>
				<ul class="list-disc pl-5 text-sm text-neutral-700 space-y-1">
					<li>NEWS2 should supplement, not replace, clinical judgment</li>
					<li>Local escalation protocols may vary - follow your organization's guidelines</li>
					<li>Document all observations and escalation decisions</li>
					<li>For COVID-19 patients: any increase in oxygen requirements should trigger escalation</li>
				</ul>
			</article>
		</div>

		<footer class="rounded-lg bg-neutral-100 p-6 text-center text-sm text-neutral-600">
			<p>
				Based on the Royal College of Physicians' NEWS2 system. For official guidance, visit
				<a
					href="https://www.rcp.ac.uk/improving-care/resources/national-early-warning-score-news-2/"
					target="_blank"
					rel="noreferrer"
					class="text-primary-600 underline hover:text-primary-700"
				>
					RCP NEWS2 Resources
				</a>
			</p>
		</footer>
	</div>
</section>
