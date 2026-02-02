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

<div class="bg-desk flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-xl">
		<h1 class="font-hand text-ink mb-2 text-center text-5xl font-bold">Ma Trousse</h1>
		<p class="font-hand text-center text-xl text-slate-700">Votre cahier de prof numérique</p>
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
		<div class="cahier-page relative px-4 py-8 sm:px-10">
			<div
				class="absolute -top-3 left-1/2 h-8 w-32 -translate-x-1/2 rotate-2 transform bg-yellow-200 opacity-80 shadow-sm"
			></div>

			<div class="relative z-10 mb-6 flex justify-center">
				<nav class="flex space-x-6" aria-label="Tabs">
					<button
						onclick={() => (isLogin = true)}
						class="{isLogin
							? 'text-ink border-ink-blue scale-110 font-bold'
							: 'border-transparent text-gray-500 hover:text-gray-700'} font-hand whitespace-nowrap border-b-2 pb-1 text-xl transition-all duration-200"
					>
						Connexion
					</button>
					<button
						onclick={() => (isLogin = false)}
						class="{!isLogin
							? 'text-ink border-ink-blue scale-110 font-bold'
							: 'border-transparent text-gray-500 hover:text-gray-700'} font-hand whitespace-nowrap border-b-2 pb-1 text-xl transition-all duration-200"
					>
						Inscription
					</button>
				</nav>
			</div>

			<div class="relative z-10 flex justify-center pl-0 pr-0 sm:pl-12 sm:pr-4">
				<PostIt variant="yellow" fullWidth pinned={false} rotate={-1}>
					{#if isLogin}
						<Login {form} />
					{:else}
						<Signup {form} />
					{/if}

					<div class="mt-6">
						<div class="relative">
							<div class="absolute inset-0 flex items-center">
								<div class="w-full border-t border-dashed border-yellow-300"></div>
							</div>
							<div class="relative flex justify-center text-sm">
								<span class="font-hand bg-yellow-100 px-2 text-lg text-gray-500">
									{isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
								</span>
							</div>
						</div>

						<div class="mt-4 grid grid-cols-1 gap-3">
							<button
								onclick={toggleAuthMode}
								class="font-hand inline-flex w-full justify-center rounded-lg border-2 border-dashed border-gray-400 bg-transparent px-4 py-2 text-lg font-bold text-gray-600 shadow-sm transition-colors hover:border-gray-600 hover:bg-white/50"
							>
								{isLogin ? 'Créer un compte' : 'Se connecter'}
							</button>
						</div>
					</div>
				</PostIt>
			</div>
		</div>
	</div>

	<div class="font-hand mt-8 text-center text-gray-600">&copy; 2026 Ma Trousse.</div>
</div>
