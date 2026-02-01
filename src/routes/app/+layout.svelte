<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

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

<div class="min-h-screen bg-gray-100">
	<nav class="bg-white shadow-sm">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 justify-between">
				<div class="flex">
					<div class="flex flex-shrink-0 items-center">
						<span class="text-xl font-bold text-indigo-600">Ma Trousse</span>
					</div>
					<div class="hidden sm:ml-6 sm:flex sm:space-x-8">
						<a
							href="/app"
							class="inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors {$page
								.url.pathname === '/app'
								? 'border-indigo-500 text-gray-900'
								: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
						>
							Accueil
						</a>
						<a
							href="/app/ma-classe"
							class="inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors {$page.url.pathname.startsWith(
								'/app/ma-classe'
							)
								? 'border-indigo-500 text-gray-900'
								: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
						>
							Ma Classe
						</a>
					</div>
				</div>
				<div class="flex items-center">
					<button
						on:click={() => supabase.auth.signOut()}
						class="ml-4 rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					>
						Se déconnecter
					</button>
				</div>
			</div>
		</div>
	</nav>
	<main>
		<div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
			<slot />
		</div>
	</main>
</div>
