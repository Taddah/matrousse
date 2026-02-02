<script lang="ts">
	import { enhance } from '$app/forms';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { deriveKey, encryptionKey, base64ToUint8Array } from '$lib/crypto';
	import type { SubmitFunction } from '@sveltejs/kit';

	type LoginForm = {
		success?: boolean;
		message?: string;
		email?: string | File | null;
		session?: unknown;
		missing?: boolean;
	} | null;

	let { form }: { form: LoginForm } = $props();

	let loading = $state(false);
	let message = $state('');
	let error = $state(false);

	$effect(() => {
		if (form?.message) {
			error = !form.success;
			message = form.message;
		}
	});

	const handleSubmit: SubmitFunction = ({ formData }) => {
		loading = true;
		message = '';
		error = false;

		const password = formData.get('password') as string;

		return async ({ result }) => {
			loading = false;

			if (result.type === 'success' && result.data?.success) {
				const session = result.data.session;

				try {
					const saltBase64 = session?.user?.user_metadata?.encryption_salt;
					if (!saltBase64) {
						throw new Error('Données de sécurité manquantes (Salt).');
					}
					const salt = base64ToUint8Array(saltBase64);
					const key = await deriveKey(password, salt);
					encryptionKey.set(key);
				} catch (e) {
					console.error('Crypto key derivation failed:', e);
					error = true;
					message = e instanceof Error ? e.message : 'Erreur lors de la sécurisation (Crypto).';
					return;
				}

				if (result.data.session) {
					await supabase.auth.setSession(result.data.session);
				}
				await goto('/app');
			} else if (result.type === 'failure') {
				error = true;
				message = result.data?.message || 'Erreur de connexion';
			}
		};
	};
</script>

<div class="w-full">
	<form class="space-y-6" method="POST" action="?/login" use:enhance={handleSubmit}>
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
					autocomplete="current-password"
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
				{loading ? 'Connexion en cours...' : 'Se connecter'}
			</button>
		</div>
	</form>
</div>
