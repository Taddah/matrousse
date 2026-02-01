<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import StickerButton from '$lib/components/ui/StickerButton.svelte';

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (!session) {
				goto('/');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<div class="min-h-screen flex flex-col sm:flex-row bg-stone-800">
	<nav
		class="bg-stone-700 w-full sm:w-64 flex-shrink-0 flex flex-col p-6 z-10 text-white shadow-2xl relative"
	>
		<div
			class="absolute right-0 top-0 bottom-0 w-4 bg-stone-900 opacity-20 shadow-inner pointer-events-none"
		></div>

		<div class="mb-10 text-center sm:text-left pl-2">
			<span
				class="text-3xl font-hand font-bold text-white tracking-wider transform -rotate-1 inline-block border-b-2 border-yellow-200 pb-1"
				>Ma Trousse</span
			>
		</div>

		<div class="flex-1 flex flex-col space-y-4 pl-4">
			<a
				href="/app"
				class="group flex items-center px-4 py-3 text-lg font-hand rounded-l-lg transition-all duration-200
                    {$page.url.pathname === '/app'
					? 'bg-white text-ink shadow-[5px_0_10px_rgba(0,0,0,0.1)] translate-x-2'
					: 'text-stone-300 hover:text-white hover:bg-stone-600'}"
			>
				<span class="transform group-hover:scale-110 transition-transform mr-3">🏠</span>
				Accueil
			</a>
			<a
				href="/app/ma-classe"
				class="group flex items-center px-4 py-3 text-lg font-hand rounded-l-lg transition-all duration-200
                    {$page.url.pathname.startsWith('/app/ma-classe')
					? 'bg-white text-ink shadow-[5px_0_10px_rgba(0,0,0,0.1)] translate-x-2'
					: 'text-stone-300 hover:text-white hover:bg-stone-600'}"
			>
				<span class="transform group-hover:scale-110 transition-transform mr-3">🎓</span>
				Ma Classe
			</a>
		</div>

		<div class="mt-auto pl-4">
			<div
				class="p-4 bg-stone-600 rounded-lg transform rotate-1 border border-stone-500 shadow-inner"
			>
				<p class="text-xs text-stone-300 font-hand mb-2">Utilisateur connecté</p>
				<StickerButton
					onclick={() => supabase.auth.signOut()}
					variant="red"
					class="w-full !px-4 !py-1 !text-base"
				>
					Fermer le cahier
				</StickerButton>
			</div>
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
