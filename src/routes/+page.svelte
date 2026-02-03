<script lang="ts">
	import Login from '$lib/components/Login.svelte';
	import Signup from '$lib/components/Signup.svelte';
	import PostIt from '$lib/components/ui/PostIt.svelte';
	import Doodle from '$lib/components/ui/Doodle.svelte';
	import PaperModal from '$lib/components/ui/PaperModal.svelte';
	import { send, receive } from '$lib/utils/animations';

	import type { ActionData } from './$types';

	import { isMobile } from '$lib/stores/isMobile';

	let { form }: { form: ActionData } = $props();

	let isLogin = $state(true);
	let activePopup: 'ma-classe' | 'apprec-ia' | 'privacy' | null = $state(null);

	function toggleAuthMode() {
		isLogin = !isLogin;
	}

	function closePopup() {
		activePopup = null;
	}
</script>

<svelte:head>
	<title>Ma Trousse</title>
</svelte:head>

<div
	class="paper-seyes relative flex h-screen w-screen flex-col overflow-hidden p-4 sm:p-6"
	class:overflow-y-auto={$isMobile}
>
	<div class="pointer-events-none absolute inset-0 z-0">
		<Doodle type="star" class="absolute left-[5%] top-[5%] h-10 w-10 -rotate-12 text-yellow-400" />
		<Doodle
			type="spiral"
			class="absolute bottom-[5%] right-[5%] h-14 w-14 rotate-45 text-blue-300"
		/>
		<Doodle
			type="arrow"
			class="absolute bottom-[20%] left-[2%] h-16 w-16 -rotate-90 text-red-300"
		/>
		<Doodle
			type="smiley"
			class="absolute right-[10%] top-[10%] h-12 w-12 rotate-12 text-green-400"
		/>
		<Doodle type="flower" class="absolute left-[45%] top-[2%] h-8 w-8 rotate-6 text-pink-300" />
		<Doodle
			type="underline"
			class="absolute bottom-[40%] left-[25%] h-6 w-24 rotate-3 text-purple-300"
		/>
	</div>

	<div class="relative z-10 mb-2 flex-none text-center">
		<h1 class="font-hand text-ink mb-1 text-4xl font-bold sm:text-5xl">Ma Trousse</h1>
		<p class="font-hand text-lg text-slate-700 sm:text-xl">Votre cahier de prof numérique</p>
	</div>

	<div
		class="relative z-10 flex flex-1 overflow-y-auto overflow-x-hidden sm:items-center sm:justify-center sm:overflow-visible"
	>
		<div
			class="grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-8 lg:grid-cols-12 lg:gap-8"
		>
			<div class="flex items-center justify-center lg:col-span-5">
				<PostIt
					variant="yellow"
					rotate={-2}
					fullWidth
					class="max-w-sm duration-300 hover:scale-105"
				>
					<div class="mb-3 flex justify-center border-b-2 border-dashed border-gray-300 pb-3">
						<nav class="flex space-x-6">
							<button
								onclick={() => (isLogin = true)}
								class="{isLogin
									? 'text-ink scale-110 font-bold'
									: 'text-gray-500 hover:text-gray-700'} font-hand text-2xl transition-all duration-200"
							>
								Connexion
							</button>
							<span class="font-hand text-2xl text-gray-400">/</span>
							<button
								onclick={() => (isLogin = false)}
								class="{!isLogin
									? 'text-ink scale-110 font-bold'
									: 'text-gray-500 hover:text-gray-700'} font-hand text-2xl transition-all duration-200"
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

					<div class="mt-4 border-t-2 border-dashed border-gray-300 pt-3">
						<button
							onclick={toggleAuthMode}
							class="font-hand w-full text-center text-lg font-bold text-gray-500 hover:text-gray-700 hover:underline"
						>
							{isLogin ? 'Créer un compte ->' : '<- Se connecter'}
						</button>
					</div>
				</PostIt>
			</div>

			<div
				class="relative flex h-auto flex-col gap-6 lg:col-span-7 lg:block lg:h-full lg:min-h-[400px] lg:gap-0"
			>
				<div class="relative z-10 lg:absolute lg:left-10 lg:top-0">
					{#if activePopup !== 'ma-classe'}
						<PostIt
							variant="pink"
							rotate={-3}
							compact
							class="mx-auto w-64 shadow-xl duration-300 hover:scale-110 hover:shadow-2xl lg:mx-0"
							onclick={() => (activePopup = 'ma-classe')}
							id="ma-classe"
							{send}
							{receive}
						>
							<h3 class="font-hand mb-1 text-2xl font-bold text-pink-800">Ma Classe</h3>
							<p class="font-hand text-lg leading-tight text-gray-800">
								Gérez vos élèves super simplement !
							</p>
							<Doodle
								type="star"
								class="absolute -right-5 -top-5 z-20 h-10 w-10 rotate-12 text-yellow-400"
							/>
						</PostIt>
					{/if}
				</div>

				<div class="relative z-20 lg:absolute lg:right-10 lg:top-24">
					{#if activePopup !== 'apprec-ia'}
						<PostIt
							variant="green"
							rotate={4}
							compact
							class="mx-auto w-64 shadow-xl duration-300 hover:scale-110 hover:shadow-2xl lg:mx-0"
							onclick={() => (activePopup = 'apprec-ia')}
							id="apprec-ia"
							{send}
							{receive}
						>
							<h3 class="font-hand mb-1 text-2xl font-bold text-green-800">Appréc-IA</h3>
							<p class="font-hand text-lg leading-tight text-gray-800">
								Des appréciations magiques avec l'IA.
							</p>
							<Doodle
								type="arrow"
								class="absolute -left-8 bottom-0 z-20 h-14 w-14 rotate-45 text-blue-500"
							/>
						</PostIt>
					{/if}
				</div>

				<div class="relative z-30 lg:absolute lg:bottom-10 lg:left-32">
					{#if activePopup !== 'privacy'}
						<PostIt
							variant="blue"
							rotate={-2}
							compact
							class="mx-auto w-64 shadow-xl duration-300 hover:scale-110 hover:shadow-2xl lg:mx-0"
							onclick={() => (activePopup = 'privacy')}
							id="privacy"
							{send}
							{receive}
						>
							<h3 class="font-hand mb-1 text-2xl font-bold text-blue-800">100% Privé</h3>
							<p class="font-hand text-lg leading-tight text-gray-800">
								Chut ! C'est crypté, on ne voit rien.
							</p>
							<Doodle
								type="heart"
								class="absolute -bottom-4 -right-4 z-20 h-10 w-10 -rotate-12 text-red-500"
							/>
						</PostIt>
					{/if}
				</div>

				<Doodle
					type="spiral"
					class="absolute left-1/4 top-1/2 hidden h-16 w-16 text-purple-300 opacity-60 lg:block"
				/>
				<Doodle
					type="circle"
					class="absolute bottom-20 right-20 hidden h-20 w-20 rotate-45 text-orange-300 opacity-60 lg:block"
				/>
			</div>
		</div>
	</div>

	<div class="font-hand flex-none py-2 text-center text-sm text-gray-500">
		&copy; 2026 Ma Trousse.
	</div>

	<PaperModal
		isOpen={activePopup === 'ma-classe'}
		onClose={closePopup}
		title="Ma Classe"
		variant="pink"
		id="ma-classe"
		{send}
		{receive}
	>
		<p class="mb-4">
			Fini les fichiers Excel illisibles ! Avec <strong>Ma Classe</strong>, vous créez votre espace
			numérique en quelques secondes.
		</p>
		<ul class="list-disc space-y-2 pl-5">
			<li>Ajoutez vos élèves un par un ou importez une liste.</li>
			<li>Visualisez votre classe en un coup d'œil.</li>
			<li>Préparez vos conseils de classe sereinement.</li>
		</ul>
	</PaperModal>

	<PaperModal
		isOpen={activePopup === 'apprec-ia'}
		onClose={closePopup}
		title="Appréc-IA"
		variant="green"
		id="apprec-ia"
		{send}
		{receive}
	>
		<p class="mb-4">L'intelligence artificielle au service de votre plume pédagogique.</p>
		<p class="mb-4">
			Remplissez quelques points forts et points d'amélioration, choisissez le ton (encouragement,
			avertissement, félicitations...), et laissez la magie opérer !
		</p>
		<p>Vous obtenez une appréciation unique, bien rédigée et personnalisée pour chaque élève.</p>
	</PaperModal>

	<PaperModal
		isOpen={activePopup === 'privacy'}
		onClose={closePopup}
		title="100% Privé & Sécurisé"
		variant="blue"
		id="privacy"
		{send}
		{receive}
	>
		<p class="mb-4">Chez Ma Trousse, la vie privée n'est pas une option, c'est la base.</p>
		<div class="mb-4 rounded-lg border border-blue-200 bg-white/50 p-4">
			<ul class="list-none space-y-3">
				<li class="flex items-center">
					<span class="mr-2 text-2xl">🇫🇷</span>
					<span><strong>Hébergé en France</strong> : Vos données restent à la maison.</span>
				</li>
				<li class="flex items-center">
					<span class="mr-2 text-2xl">🔒</span>
					<span>
						<strong>Crypté dans le navigateur</strong> : Tout est chiffré sur VOTRE ordinateur avant d'être
						envoyé. Même nous, nous ne pouvons pas lire vos données. C'est mathématique !
					</span>
				</li>
			</ul>
		</div>
		<p class="text-sm text-gray-600">
			Votre mot de passe est votre clé de déchiffrement. Ne le perdez pas, nous ne pourrons pas le
			récupérer pour vous !
		</p>
	</PaperModal>
</div>
