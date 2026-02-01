<script lang="ts">
	import Login from '$lib/components/Login.svelte';
	import Signup from '$lib/components/Signup.svelte';
	import PostIt from '$lib/components/ui/PostIt.svelte';

	import type { ActionData } from './$types';

	export let form: ActionData;

	let isLogin = true;

	function toggleAuthMode() {
		isLogin = !isLogin;
	}
</script>

<div class="min-h-screen bg-desk flex flex-col justify-center py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-xl">
		<h1 class="text-center text-5xl font-hand font-bold text-ink mb-2">Ma Trousse</h1>
		<p class="text-center text-xl font-hand text-slate-700">Votre cahier de prof numérique</p>
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
		<div class="cahier-page py-8 px-4 sm:px-10 relative">
			<div
				class="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-yellow-200 opacity-80 shadow-sm rotate-2"
			></div>

			<div class="flex justify-center mb-6 z-10 relative">
				<nav class="flex space-x-6" aria-label="Tabs">
					<button
						onclick={() => (isLogin = true)}
						class="{isLogin
							? 'text-ink border-ink-blue font-bold scale-110'
							: 'text-gray-500 border-transparent hover:text-gray-700'} whitespace-nowrap pb-1 border-b-2 font-hand text-xl transition-all duration-200"
					>
						Connexion
					</button>
					<button
						onclick={() => (isLogin = false)}
						class="{!isLogin
							? 'text-ink border-ink-blue font-bold scale-110'
							: 'text-gray-500 border-transparent hover:text-gray-700'} whitespace-nowrap pb-1 border-b-2 font-hand text-xl transition-all duration-200"
					>
						Inscription
					</button>
				</nav>
			</div>

			<div class="pl-0 sm:pl-12 pr-0 sm:pr-4 relative z-10 flex justify-center">
				<PostIt variant="yellow" fullWidth pinned={false} rotate={-1}>
					{#if isLogin}
						<Login {form} />
					{:else}
						<Signup {form} />
					{/if}

					<div class="mt-6">
						<div class="relative">
							<div class="absolute inset-0 flex items-center">
								<div class="w-full border-t border-yellow-300 border-dashed"></div>
							</div>
							<div class="relative flex justify-center text-sm">
								<span class="px-2 bg-yellow-100 font-hand text-lg text-gray-500">
									{isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
								</span>
							</div>
						</div>

						<div class="mt-4 grid grid-cols-1 gap-3">
							<button
								onclick={toggleAuthMode}
								class="w-full inline-flex justify-center py-2 px-4 border-2 border-dashed border-gray-400 rounded-lg shadow-sm bg-transparent text-lg font-hand font-bold text-gray-600 hover:bg-white/50 hover:border-gray-600 transition-colors"
							>
								{isLogin ? 'Créer un compte' : 'Se connecter'}
							</button>
						</div>
					</div>
				</PostIt>
			</div>
		</div>
	</div>

	<div class="mt-8 text-center font-hand text-gray-600">&copy; 2026 Ma Trousse.</div>
</div>
