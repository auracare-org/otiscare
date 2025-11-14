<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';

	let { children } = $props();

	function isActive(href: string) {
		const path = $page.url.pathname;
		if (href === '/' && (path === '/' || path.startsWith('/pathway'))) return true;
		return path.startsWith(href) && href !== '/';
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav
	class="sticky top-0 z-20 border-b border-neutral-100 bg-secondary-50/90 backdrop-blur supports-[backdrop-filter]:bg-secondary-50/70"
>
	<div class="container mx-auto flex h-14 items-center justify-between px-4">
		<a href="https://www.auracarehealth.com/" class="flex items-center gap-2 font-semibold">
			<span>Otoscopy by</span>
			<img src="/Asset 5.svg" alt="logo" class="h-6 w-auto" />
		</a>
		<div class="flex items-center gap-2">
			<a
				href="/"
				class={`rounded px-3 py-1 ${isActive('/') ? 'bg-primary-600 text-white' : 'hover:bg-neutral-100'}`}
				>Pathway</a
			>
			<a
				href="/doclens"
				class={`rounded px-3 py-1 ${isActive('/doclens') ? 'bg-primary-600 text-white' : 'hover:bg-neutral-100'}`}
				>DocLens</a
			>
			<a
				href="/news2"
				class={`rounded px-3 py-1 ${isActive('/news2') ? 'bg-primary-600 text-white' : 'hover:bg-neutral-100'}`}
				>NEWS2</a
			>
			<a
				href="/sources"
				class={`rounded px-3 py-1 text-neutral-500 ${isActive('/sources') ? 'bg-primary-600 text-white' : 'hover:text-neutral-700'}`}
				>Sources</a
			>
		</div>
	</div>
</nav>

<main>
	{@render children?.()}
</main>
