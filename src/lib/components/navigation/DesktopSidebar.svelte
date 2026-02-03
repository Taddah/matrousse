<script lang="ts">
	import { page } from '$app/state';
	import { supabase } from '$lib/supabase';
	import StickerButton from '$lib/components/ui/StickerButton.svelte';
	import { navigationLinks } from '$lib/config/navigation';

	let { class: className = '' } = $props();
</script>

<nav
	class="relative z-10 flex w-full flex-shrink-0 flex-col bg-indigo-900 p-6 text-white shadow-2xl sm:w-64 {className}"
>
	<div
		class="pointer-events-none absolute bottom-0 right-0 top-0 w-4 bg-indigo-950 opacity-40 shadow-inner"
	></div>

	<div class="mb-10 pl-2 text-center sm:text-left">
		<span
			class="font-hand inline-block -rotate-1 transform border-b-2 border-yellow-200 pb-1 text-3xl font-bold tracking-wider text-white"
			>Ma Trousse</span
		>
	</div>

	<div class="flex flex-1 flex-col space-y-6 pr-0">
		{#each navigationLinks as link}
			{@const isActive =
				link.href === '/app'
					? page.url.pathname === link.href
					: page.url.pathname.startsWith(link.href)}
			<a
				href={link.href}
				class="font-hand group relative z-20 mr-[-2.5rem] flex items-center rounded-r-xl border-l-4 px-4 py-3 text-lg shadow-md transition-all duration-300
                {link.color.base}
                {isActive
					? `translate-x-2 font-bold ring-2 ${link.color.activeRing}`
					: '-translate-x-4 opacity-90 hover:-translate-x-2 hover:opacity-100'}"
			>
				<span class="mr-3 transform text-2xl transition-transform group-hover:scale-110"
					>{link.icon}</span
				>
				{link.label}
			</a>
		{/each}
	</div>

	<div class="mt-auto pl-4">
		<StickerButton
			onclick={() => supabase.auth.signOut()}
			variant="red"
			class="w-full !px-4 !py-1 !text-base"
		>
			Fermer le cahier
		</StickerButton>
	</div>
</nav>
