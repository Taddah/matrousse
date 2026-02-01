<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';

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
						<span class="text-xl font-bold text-indigo-600">MaTrousse</span>
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
