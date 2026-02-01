<script lang="ts">
	import PostIt from '$lib/components/ui/PostIt.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ profile } = data);
</script>

<div class="flex h-full items-center justify-center px-4 py-6 sm:px-0">
	<PostIt variant="yellow" rotate={1} minHeight="24rem">
		{#if profile}
			<h1 class="mb-6 transform -rotate-2 font-hand text-5xl font-bold text-ink">
				Bienvenue {profile.full_name || profile.first_name || 'maîtresse'} !
			</h1>
			<p class="mb-8 font-hand text-2xl text-gray-700">Prête pour une nouvelle journée ?</p>

			<div class="transform rotate-1 border-l-4 border-red-300 py-2 pl-4 text-left">
				<h3 class="font-hand text-2xl font-bold text-ink">Mes infos :</h3>
				<p class="mt-2 font-hand text-xl text-gray-700">
					<span class="font-bold">Email :</span>
					{profile.email || 'Non renseigné'}
				</p>
				<p class="font-hand text-xl text-gray-700">
					<span class="font-bold">Nom :</span>
					{profile.full_name || 'Non renseigné'}
				</p>
			</div>

			<div class="mt-12">
				<span class="inline-block select-none font-hand text-3xl text-gray-400 opacity-50"
					>✏️ 📏 ✂️</span
				>
			</div>
		{:else}
			<p class="font-hand text-2xl text-red-500">Oups, impossible de charger le profil.</p>
		{/if}
	</PostIt>
</div>
