import type { DecisionNode } from '$lib/components/decision/types';
import acuteJson from './acute_otitis_media.json';
import otitisExternaJson from './otitis_externa.json';
import otitisEffusionJson from './otitis_media_with_effusion.json';
import csomJson from './otitis_media_chronic_suppurative.json';

type PathwayMetadata = {
	version: string;
	lastUpdated: string;
	sources: string[];
	niceGuideline: string;
};

export type PathwayJson = {
	pathway: string;
	metadata: PathwayMetadata;
	notes: string[];
	decisionTree: DecisionNode;
	pgds?: Record<string, unknown>;
	selfCareAndSafetyNetting?: {
		selfCare?: string[];
		education?: string[];
		safetyNet?: string[];
		referral?: string[];
	};
	[key: string]: unknown;
};

const acute = acuteJson as PathwayJson;
const otitisExterna = otitisExternaJson as PathwayJson;
const otitisEffusion = otitisEffusionJson as PathwayJson;
const csom = csomJson as PathwayJson;

export type PathwayEntry = {
	id: string;
	title: string;
	summary: string;
	ageRange?: string;
	tags?: string[];
	data: PathwayJson;
};

export const pharmacyFirstPathways: PathwayEntry[] = [
	{
		id: 'acute-otitis-media',
		title: 'Acute Otitis Media',
		summary: 'Children and young people aged 1–17 years with acute middle-ear infection.',
		ageRange: '1–17 years',
		tags: ['ear infection', 'AOM', 'antibiotics'],
		data: acute
	},
	{
		id: 'otitis-externa',
		title: 'Otitis Externa',
		summary: 'Diffuse inflammation of the external auditory canal in patients ≥1 year.',
		ageRange: '≥1 year',
		tags: ['ear drops', 'outer ear'],
		data: otitisExterna
	},
	{
		id: 'otitis-media-with-effusion',
		title: 'Otitis Media with Effusion (Glue Ear)',
		summary: 'Non-suppurative middle-ear effusion with conductive hearing loss or fullness.',
		ageRange: 'Children & young people',
		tags: ['hearing', 'watchful waiting'],
		data: otitisEffusion
	},
	{
		id: 'chronic-suppurative-otitis-media',
		title: 'Chronic Suppurative Otitis Media',
		summary: 'Persistent otorrhoea through a perforated tympanic membrane, adolescents/adults.',
		ageRange: '≥12 years',
		tags: ['CSOM', 'ear discharge'],
		data: csom
	}
];

export const defaultPathwayId = pharmacyFirstPathways[0]?.id ?? null;

export function getPathwayById(id: string | null | undefined) {
	if (!id) return null;
	return pharmacyFirstPathways.find((entry) => entry.id === id) ?? null;
}
