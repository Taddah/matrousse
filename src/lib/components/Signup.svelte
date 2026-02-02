<script lang="ts">
	import { enhance } from '$app/forms';
	import { deriveKey, encryptionKey, generateSalt, arrayBufferToBase64 } from '$lib/crypto';
	import type { SubmitFunction } from '@sveltejs/kit';

	type SignupForm = {
		success?: boolean;
		message?: string;
		email?: string | File | null;
		session?: unknown;
	} | null;

	let { form }: { form: SignupForm } = $props();

	let loading = $state(false);
	let message = $state('');
	let error = $state(false);

	$effect(() => {
		if (form?.message && !form.success) {
			error = true;
			message = form.message;
		}
	});

	const handleSubmit: SubmitFunction = ({ formData }) => {
		loading = true;
		message = '';
		error = false;

		const password = formData.get('password') as string;

		const salt = generateSalt();
		const saltBase64 = arrayBufferToBase64(salt);
		formData.append('encryptionSalt', saltBase64);

		return async ({ result }) => {
			loading = false;

			if (result.type === 'success' && result.data?.success) {
				try {
					const key = await deriveKey(password, salt);
					encryptionKey.set(key);
				} catch {
					error = true;
					message = 'Erreur lors de la sécurisation (Crypto).';
					return;
				}

				error = false;
				message = 'Inscription réussie ! Vérifiez votre email pour le lien de confirmation.';
			} else if (result.type === 'failure') {
				error = true;
				message = result.data?.message || "Une erreur est survenue lors de l'inscription.";
			}
		};
	};
</script>

<div class="w-full">
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
						class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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
						class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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
					class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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
					class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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
				class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
			>
				{loading ? 'Chargement...' : "S'inscrire"}
			</button>
		</div>
	</form>
</div>
