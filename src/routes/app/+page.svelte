<script lang="ts">
	import PostIt from '$lib/components/ui/PostIt.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ profile } = data);
</script>

<div class="flex h-full items-center justify-center px-4 py-6 sm:px-0">
	<PostIt variant="yellow" rotate={1} minHeight="24rem">
		{#if profile}
			<h1 class="font-hand text-ink mb-6 -rotate-2 transform text-5xl font-bold">
				Bienvenue {profile.full_name || profile.first_name || 'professeur'} !
			</h1>
			<p class="font-hand mb-8 text-2xl text-gray-700">Prête pour une nouvelle journée ?</p>

			<div class="rotate-1 transform border-l-4 border-red-300 py-2 pl-4 text-left">
				<h3 class="font-hand text-ink text-2xl font-bold">Mes infos :</h3>
				<p class="font-hand mt-2 text-xl text-gray-700">
					<span class="font-bold">Email :</span>
					{profile.email || 'Non renseigné'}
				</p>
				<p class="font-hand text-xl text-gray-700">
					<span class="font-bold">Nom :</span>
					{profile.full_name || 'Non renseigné'}
				</p>
			</div>

			<div class="mt-12">
				<span class="font-hand inline-block select-none text-3xl text-gray-400 opacity-50"
					>✏️ 📏 ✂️</span
				>
			</div>
		{:else}
			<p class="font-hand text-2xl text-red-500">Oups, impossible de charger le profil.</p>
		{/if}
	</PostIt>
</div>
