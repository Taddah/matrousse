<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ profile } = data);
</script>

<div class="px-4 py-6 sm:px-0">
	<div
		class="rounded-lg border-4 border-dashed border-gray-200 p-8 text-center h-96 flex flex-col items-center justify-center"
	>
		{#if profile}
			<h1 class="text-3xl font-bold text-gray-900 mb-4">
				Bienvenue, {profile.full_name || profile.first_name || 'Utilisateur'} !
			</h1>
			<p class="text-lg text-gray-600">Vous êtes connecté sur votre espace sécurisé.</p>
			<div class="mt-6 p-4 bg-white shadow rounded-lg max-w-sm mx-auto text-left">
				<h3 class="font-semibold text-gray-700">Vos informations :</h3>
				<p class="text-gray-600 mt-2">
					<strong>Email :</strong>
					{profile.email || 'Non renseigné'}
				</p>
				<p class="text-gray-600">
					<strong>Nom complet :</strong>
					{profile.full_name || 'Non renseigné'}
				</p>
			</div>
		{:else}
			<p class="text-red-500">Impossible de charger le profil.</p>
		{/if}
	</div>
</div>
