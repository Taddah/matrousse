<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { encryptionKey } from '$lib/crypto';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import StickerButton from '$lib/components/ui/StickerButton.svelte';
	import NotificationToast from '$lib/components/ui/NotificationToast.svelte';
	import type { LayoutData } from './$types';

	let { data, children } = $props<{ data: LayoutData; children: import('svelte').Snippet }>();

	$effect(() => {
		if (browser && data.session && !$encryptionKey) {
			console.warn('Session active sans clé de chiffrement. Déconnexion de sécurité.');
			supabase.auth.signOut().then(() => goto('/'));
		}
	});

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			if (!session) {
				await goto('/');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<NotificationToast />

<div class="flex min-h-screen flex-col bg-slate-800 sm:flex-row">
	<nav
		class="relative z-10 flex w-full flex-shrink-0 flex-col bg-indigo-900 p-6 text-white shadow-2xl sm:w-64"
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
			<a
				href="/app"
				class="font-hand group relative z-20 mr-[-2.5rem] flex items-center rounded-r-xl border-l-4 border-indigo-800/20 bg-emerald-200 px-4 py-3 text-lg text-emerald-900 shadow-md
                    transition-all duration-300
                    {page.url.pathname === '/app'
					? 'translate-x-2 font-bold ring-2 ring-emerald-300'
					: '-translate-x-4 opacity-90 hover:-translate-x-2 hover:opacity-100'}"
			>
				<span class="mr-3 transform text-2xl transition-transform group-hover:scale-110">🏠</span>
				Accueil
			</a>

			<a
				href="/app/ma-classe"
				class="font-hand group relative z-20 mr-[-2.5rem] flex items-center rounded-r-xl border-l-4 border-indigo-800/20 bg-rose-200 px-4 py-3 text-lg text-rose-900 shadow-md
                    transition-all duration-300
                    {page.url.pathname.startsWith('/app/ma-classe')
					? 'translate-x-2 font-bold ring-2 ring-rose-300'
					: '-translate-x-4 opacity-90 hover:-translate-x-2 hover:opacity-100'}"
			>
				<span class="mr-3 transform text-2xl transition-transform group-hover:scale-110">🎓</span>
				Ma Classe
			</a>

			<a
				href="/app/appreciations"
				class="font-hand group relative z-20 mr-[-2.5rem] flex items-center rounded-r-xl border-l-4 border-indigo-800/20 bg-amber-200 px-4 py-3 text-lg text-amber-900 shadow-md
                    transition-all duration-300
                    {page.url.pathname.startsWith('/app/appreciations')
					? 'translate-x-2 font-bold ring-2 ring-amber-300'
					: '-translate-x-4 opacity-90 hover:-translate-x-2 hover:opacity-100'}"
			>
				<span class="mr-3 transform text-2xl transition-transform group-hover:scale-110">✨</span>
				Appréc-IA
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

	<main class="paper-lined relative flex-1 overflow-y-auto bg-white shadow-inner sm:rounded-tl-md">
		<div
			class="pointer-events-none absolute bottom-0 left-12 top-0 hidden w-0.5 bg-red-300 opacity-60 sm:block"
		></div>

		<div class="min-h-full p-6 sm:p-12 sm:pl-20">
			{@render children()}
		</div>
	</main>
</div>
