import type { PathwayJson } from '$lib/nice_pathways/catalog';

export type PathwayDefinition = {
	slug: string;
	title: string;
	subtitle: string;
	ageRange: string;
	setting: string;
	tags?: string[];
	summaryPoints?: string[];
	getData: () => Promise<PathwayJson>;
};
