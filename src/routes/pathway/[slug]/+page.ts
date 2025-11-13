import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPathwayDefinition } from '$lib/pathways/registry';

export const load: PageLoad = async ({ params }) => {
	const slug = params.slug;
	const definition = getPathwayDefinition(slug);
	if (!definition) {
		throw error(404, 'Pathway not found');
	}
	const pathway = await definition.getData();
	return {
		definition,
		pathway
	};
};
