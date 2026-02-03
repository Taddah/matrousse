<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { encryptionKey } from '$lib/crypto';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import NotificationToast from '$lib/components/ui/NotificationToast.svelte';
	import DesktopSidebar from '$lib/components/navigation/DesktopSidebar.svelte';
	import MobileMenu from '$lib/components/navigation/MobileMenu.svelte';
	import type { LayoutData } from './$types';

	import { isMobile } from '$lib/stores/isMobile';

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
	{#if !$isMobile}
		<DesktopSidebar />
	{/if}

	<main
		class="paper-lined relative flex-1 overflow-y-auto bg-white pb-20 shadow-inner sm:rounded-tl-md sm:pb-0"
	>
		<div
			class="pointer-events-none absolute bottom-0 left-4 top-0 z-0 hidden w-0.5 bg-red-300 opacity-60 sm:left-12 sm:block"
		></div>

		<div class="relative z-10 min-h-full p-4 sm:p-12 sm:pl-20">
			{@render children()}
		</div>
	</main>

	{#if $isMobile}
		<MobileMenu />
	{/if}
</div>
