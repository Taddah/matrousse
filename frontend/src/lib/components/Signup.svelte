<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from '../../routes/$types';

	export let form: ActionData;

	let loading = false;
	let message = '';
	let error = false;

	$: if (form?.message && !form.success) {
		error = true;
		message = form.message;
	}

	const handleSubmit = () => {
		loading = true;
		message = '';
		error = false;

		return async ({ result }: { result: any }) => {
			loading = false;

			if (result.type === 'success' && result.data?.success) {
				error = false;
				message = 'Inscription réussie ! Vérifiez votre email pour le lien de confirmation.';
			} else if (result.type === 'failure') {
				error = true;
				message = result.data?.message || "Une erreur est survenue lors de l'inscription.";
			}
		};
	};
</script>

<div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
	<form class="space-y-6" method="POST" action="?/signup" use:enhance={handleSubmit}>
		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="firstName" class="block text-sm font-medium text-gray-700"> Prénom </label>
				<div class="mt-1">
					<input
						id="firstName"
						name="firstName"
						type="text"
						required
						class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
					/>
				</div>
			</div>

			<div>
				<label for="lastName" class="block text-sm font-medium text-gray-700"> Nom </label>
				<div class="mt-1">
					<input
						id="lastName"
						name="lastName"
						type="text"
						required
						class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
					/>
				</div>
			</div>
		</div>

		<div>
			<label for="email" class="block text-sm font-medium text-gray-700"> Email </label>
			<div class="mt-1">
				<input
					id="email"
					name="email"
					type="email"
					autocomplete="email"
					required
					value={form?.email ?? ''}
					class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
				/>
			</div>
		</div>

		<div>
			<label for="password" class="block text-sm font-medium text-gray-700"> Mot de passe </label>
			<div class="mt-1">
				<input
					id="password"
					name="password"
					type="password"
					autocomplete="new-password"
					required
					class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
				/>
			</div>
		</div>

		{#if message}
			<div
				class={`rounded-md p-4 ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}
			>
				<div class="text-sm">
					{message}
				</div>
			</div>
		{/if}

		<div>
			<button
				type="submit"
				disabled={loading}
				class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
			>
				{loading ? 'Chargement...' : "S'inscrire"}
			</button>
		</div>
	</form>
</div>
