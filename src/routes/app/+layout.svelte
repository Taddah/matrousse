<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { supabase } from '$lib/supabase';
	import { encryptionKey } from '$lib/crypto';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import StickerButton from '$lib/components/ui/StickerButton.svelte';
	import NotificationToast from '$lib/components/ui/NotificationToast.svelte';

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			if (!session) {
				await goto('/');
			} else if (!get(encryptionKey)) {
				await supabase.auth.signOut();
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<NotificationToast />

<div class="min-h-screen flex flex-col sm:flex-row bg-slate-800">
	<nav
		class="bg-indigo-900 w-full sm:w-64 flex-shrink-0 flex flex-col p-6 z-10 text-white shadow-2xl relative"
	>
		<div
			class="absolute right-0 top-0 bottom-0 w-4 bg-indigo-950 opacity-40 shadow-inner pointer-events-none"
		></div>

		<div class="mb-10 text-center sm:text-left pl-2">
			<span
				class="text-3xl font-hand font-bold text-white tracking-wider transform -rotate-1 inline-block border-b-2 border-yellow-200 pb-1"
				>Ma Trousse</span
			>
		</div>

		<div class="flex-1 flex flex-col space-y-6 pr-0">
			<a
				href="/app"
				class="group flex items-center px-4 py-3 text-lg font-hand rounded-r-xl transition-all duration-300 relative shadow-md mr-[-2.5rem] z-20 border-l-4 border-indigo-800/20
                    bg-emerald-200 text-emerald-900
                    {$page.url.pathname === '/app'
					? 'translate-x-2 font-bold ring-2 ring-emerald-300'
					: '-translate-x-4 opacity-90 hover:opacity-100 hover:-translate-x-2'}"
			>
				<span class="transform group-hover:scale-110 transition-transform mr-3 text-2xl">🏠</span>
				Accueil
			</a>

			<a
				href="/app/ma-classe"
				class="group flex items-center px-4 py-3 text-lg font-hand rounded-r-xl transition-all duration-300 relative shadow-md mr-[-2.5rem] z-20 border-l-4 border-indigo-800/20
                    bg-rose-200 text-rose-900
                    {$page.url.pathname.startsWith('/app/ma-classe')
					? 'translate-x-2 font-bold ring-2 ring-rose-300'
					: '-translate-x-4 opacity-90 hover:opacity-100 hover:-translate-x-2'}"
			>
				<span class="transform group-hover:scale-110 transition-transform mr-3 text-2xl">🎓</span>
				Ma Classe
			</a>
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

	<main class="flex-1 bg-white relative paper-lined sm:rounded-tl-md shadow-inner overflow-y-auto">
		<div
			class="hidden sm:block absolute top-0 bottom-0 left-12 w-0.5 bg-red-300 opacity-60 pointer-events-none"
		></div>

		<div class="p-6 sm:p-12 sm:pl-20 min-h-full">
			<slot />
		</div>
	</main>
</div>
