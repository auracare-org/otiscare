import type { PathwayDefinition } from './types';
import type { PathwayJson } from '$lib/nice_pathways/catalog';
import acute from '$lib/nice_pathways/acute_otitis_media.json';
import shingles from '$lib/nice_pathways/shingles_pharmacy_first.json';
import impetigo from '$lib/nice_pathways/impetigo_pharmacy_first.json';
import infectedInsectBites from '$lib/nice_pathways/infected_insect_bites_pharmacy_first.json';
import acuteSoreThroat from '$lib/nice_pathways/acute_sore_throat_pharmacy_first.json';
import acuteSinusitis from '$lib/nice_pathways/acute_sinusitis_pharmacy_first.json';
import utiLower from '$lib/nice_pathways/uncomplicated_uti_pharmacy_first.json';

const acutePathway = acute as PathwayJson;
const shinglesPathway = shingles as PathwayJson;
const impetigoPathway = impetigo as PathwayJson;
const insectBitePathway = infectedInsectBites as PathwayJson;
const soreThroatPathway = acuteSoreThroat as PathwayJson;
const sinusitisPathway = acuteSinusitis as PathwayJson;
const utiPathway = utiLower as PathwayJson;

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
	},
	{
		slug: 'pharmacy-first-shingles',
		title: 'Shingles',
		subtitle: 'Pharmacy First | Adults 18 years and over',
		ageRange: '≥18 years',
		setting: 'Community pharmacy, urgent care, primary care',
		tags: ['shingles', 'dermatology', 'pharmacy first'],
		summaryPoints: [
			'Implements NHSE Pharmacy First aciclovir and valaciclovir PGDs',
			'Captures risk screening, rash timing (≤72 h, ≤7 days) and eligibility criteria',
			'Builds in self-care, safety-netting and immunosuppressed patient actions'
		],
		getData: async () => shinglesPathway
	},
	{
		slug: 'pharmacy-first-impetigo',
		title: 'Impetigo',
		subtitle: 'Pharmacy First | Non-bullous impetigo ≥1 year',
		ageRange: '≥1 year',
		setting: 'Community pharmacy, urgent care, primary care',
		tags: ['impetigo', 'dermatology', 'pharmacy first'],
		summaryPoints: [
			'Clinically screens for complications, lesion count and atypical presentations',
			'Supports topical hydrogen peroxide/fusidic acid vs oral flucloxacillin or macrolides',
			'Includes PGD self-care, hygiene advice and escalation triggers'
		],
		getData: async () => impetigoPathway
	},
	{
		slug: 'pharmacy-first-infected-insect-bites',
		title: 'Infected Insect Bites',
		subtitle: 'Pharmacy First | Adults & children ≥1 year',
		ageRange: '≥1 year',
		setting: 'Community pharmacy, urgent care, primary care',
		tags: ['dermatology', 'bites', 'pharmacy first'],
		summaryPoints: [
			'Screens for travel/animal exposures, systemic red flags and inflammatory vs infective reactions',
			'Guides antihistamine/self-care vs oral antibiotics with penicillin allergy + pregnancy branches',
			'Aligns with NHSE flucloxacillin PGD plus safety-netting and monitoring instructions'
		],
		getData: async () => insectBitePathway
	},
	{
		slug: 'pharmacy-first-acute-sore-throat',
		title: 'Acute Sore Throat',
		subtitle: 'Pharmacy First | Adults and children ≥5 years',
		ageRange: '≥5 years',
		setting: 'Community pharmacy, urgent care, primary care',
		tags: ['respiratory', 'sore throat', 'pharmacy first'],
		summaryPoints: [
			'Implements FeverPAIN scoring with shared decision-making guidance',
			'Balances self-care, watchful waiting, and immediate antibiotic pathways',
			'Includes PGD dosing for phenoxymethylpenicillin, clarithromycin, and erythromycin'
		],
		getData: async () => soreThroatPathway
	},
	{
		slug: 'pharmacy-first-acute-sinusitis',
		title: 'Acute Sinusitis',
		subtitle: 'Pharmacy First | Adults and young people ≥12 years',
		ageRange: '≥12 years',
		setting: 'Community pharmacy, urgent care, primary care',
		tags: ['sinusitis', 'respiratory', 'pharmacy first'],
		summaryPoints: [
			'Distinguishes viral vs bacterial sinusitis (duration, deterioration, purulence, unilateral pain)',
			'Supports high-dose intranasal steroid first-line with escalation to antibiotics when needed',
			'Includes PGD dosing for phenoxymethylpenicillin, clarithromycin/doxycycline, and erythromycin in pregnancy'
		],
		getData: async () => sinusitisPathway
	},
	{
		slug: 'pharmacy-first-uti',
		title: 'Uncomplicated UTI',
		subtitle: 'Pharmacy First | Non-pregnant women 16–64 years',
		ageRange: '16–64 years',
		setting: 'Community pharmacy, urgent care, sexual health',
		tags: ['urinary', 'pharmacy first', 'nitrofurantoin'],
		summaryPoints: [
			'Incorporates sepsis/pyelonephritis red flags and alternative diagnosis checks',
			'Uses the three key diagnostic symptoms with shared decision pathways',
			'Supports nitrofurantoin supply (3-day) with robust safety-netting'
		],
		getData: async () => utiPathway
	}
];

export function getPathwayDefinition(slug: string) {
	return pathwayRegistry.find((entry) => entry.slug === slug) ?? null;
}
