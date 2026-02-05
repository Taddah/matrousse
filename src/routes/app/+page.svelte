<script lang="ts">
	import PostIt from '$lib/components/ui/PostIt.svelte';
	import OptionsPostIt from '$lib/components/ma-classe/post-its/OptionsPostIt.svelte';
	import type { PageData } from './$types';
	import { crossfade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { invalidateAll } from '$app/navigation';

	import { notifications } from '$lib/stores/notifications';

	export let data: PageData;
	$: ({ profile } = data);

	const [send, receive] = crossfade({
		duration: (d) => Math.sqrt(d * 200),
		fallback: (node, params) => {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			};
		}
	});

	let isOptionsOpen = false;
	let saving = false;

	async function saveOptions(options: {
		first_name: string;
		last_name: string;
		grading_system: 'percentage' | 'color' | 'letter';
	}) {
		saving = true;
		const formData = new FormData();
		formData.append('first_name', options.first_name);
		formData.append('last_name', options.last_name);
		formData.append('grading_system', options.grading_system);

		const response = await fetch('?/updateProfile', {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			await invalidateAll();
			isOptionsOpen = false;
			notifications.send('Options sauvegardées avec succès !', 'success');
		} else {
			notifications.send('Erreur lors de la sauvegarde des options.', 'error');
		}
		saving = false;
	}
</script>

<svelte:head>
	<title>Accueil - Ma Trousse</title>
</svelte:head>

<div
	class="flex h-full w-full flex-wrap items-center justify-center gap-12 overflow-y-auto p-4 sm:p-8"
>
	<!-- Post-it Accueil -->
	<div
		class="relative w-full max-w-md transition-all duration-300 {isOptionsOpen
			? 'pointer-events-none absolute opacity-0'
			: ''}"
	>
		<PostIt variant="yellow" rotate={1} minHeight="24rem">
			{#if profile}
				<h1 class="font-hand text-ink mb-6 -rotate-2 transform text-5xl font-bold">
					Bienvenue {profile.full_name || profile.first_name || 'professeur'} !
				</h1>
				<p class="font-hand mb-8 text-2xl text-gray-700">Prêt pour une nouvelle journée ?</p>

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

				<div class="mt-12 text-center">
					<span class="font-hand inline-block select-none text-3xl text-gray-400 opacity-50"
						>✏️ 📏 ✂️</span
					>
				</div>
			{:else}
				<p class="font-hand text-2xl text-red-500">Oups, impossible de charger le profil.</p>
			{/if}
		</PostIt>
	</div>

	{#if profile}
		<OptionsPostIt
			isActive={isOptionsOpen}
			onOpen={() => (isOptionsOpen = true)}
			onClose={() => (isOptionsOpen = false)}
			onSave={saveOptions}
			{saving}
			{profile}
			{send}
			{receive}
		/>
	{/if}
</div>
