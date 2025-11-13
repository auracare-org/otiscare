import type { PathwayDefinition } from './types';
import type { PathwayJson } from '$lib/nice_pathways/catalog';
import acute from '$lib/nice_pathways/acute_otitis_media.json';

const acutePathway = acute as PathwayJson;

export const pathwayRegistry: PathwayDefinition[] = [
	{
		slug: 'pharmacy-first-aom',
		title: 'Acute Otitis Media',
		subtitle: 'Pharmacy First | Children & young people 1–17 years',
		ageRange: '1–17 years',
		setting: 'Community pharmacy, urgent care, primary care',
		tags: ['otitis media', 'pharmacy first', 'pediatrics'],
		summaryPoints: [
			'Aligns with NICE NG91, NICE CKS and Pharmacy First PGDs',
			'Captures otoscopy findings, red flags, bilateral/perforation status',
			'Supports immediate vs back-up antibiotic decisions and self-care counselling'
		],
		getData: async () => acutePathway
	}
];

export function getPathwayDefinition(slug: string) {
	return pathwayRegistry.find((entry) => entry.slug === slug) ?? null;
}
