<script lang="ts">
	import Login from '$lib/components/Login.svelte';
	import Signup from '$lib/components/Signup.svelte';

	import type { ActionData } from './$types';

	export let form: ActionData;

	let isLogin = true;

	function toggleAuthMode() {
		isLogin = !isLogin;
	}
</script>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<h1 class="text-center text-4xl font-extrabold text-indigo-900 tracking-tight">Ma Trousse</h1>
		<p class="mt-2 text-center text-lg text-gray-600">Votre assistant pédagogique intelligent.</p>
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
		<div
			class="bg-white py-8 px-4 shadow-xl shadow-indigo-100 sm:rounded-lg sm:px-10 border border-gray-100"
		>
			<div class="flex justify-center mb-6 border-b border-gray-200">
				<nav class="-mb-px flex space-x-8" aria-label="Tabs">
					<button
						on:click={() => (isLogin = true)}
						class="{isLogin
							? 'border-indigo-500 text-indigo-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
					>
						Connexion
					</button>
					<button
						on:click={() => (isLogin = false)}
						class="{!isLogin
							? 'border-indigo-500 text-indigo-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
					>
						Inscription
					</button>
				</nav>
			</div>

			{#if isLogin}
				<Login {form} />
			{:else}
				<Signup {form} />
			{/if}

			<div class="mt-6">
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-300"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="px-2 bg-white text-gray-500">
							{isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
						</span>
					</div>
				</div>

				<div class="mt-6 grid grid-cols-1 gap-3">
					<button
						on:click={toggleAuthMode}
						class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
					>
						{isLogin ? 'Créer un compte' : 'Se connecter'}
					</button>
				</div>
			</div>
		</div>
	</div>

	<div class="mt-8 text-center text-sm text-gray-400">
		&copy; 2026 Ma Trousse. Tous droits réservés.
	</div>
</div>
