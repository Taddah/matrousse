<script lang="ts">
	import PostIt from '$lib/components/ui/PostIt.svelte';
	import PostItView from '$lib/components/ma-classe/PostItView.svelte';
	import type { TransitionConfig } from 'svelte/transition';

	// Define the interface for the profile data we're editing
	interface ProfileOptions {
		first_name: string;
		last_name: string;
		grading_system: 'percentage' | 'color' | 'letter';
	}

	interface Props {
		isActive: boolean;
		onOpen: () => void;
		onClose: () => void;
		onSave: (data: ProfileOptions) => void;
		saving?: boolean;
		profile: {
			first_name: string;
			last_name: string;
			grading_system: 'percentage' | 'color' | 'letter';
		};
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		send: (node: Element, params: any) => TransitionConfig | (() => TransitionConfig);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		receive: (node: Element, params: any) => TransitionConfig | (() => TransitionConfig);
	}

	let {
		isActive,
		onOpen,
		onClose,
		onSave,
		saving = false,
		profile,
		send,
		receive
	}: Props = $props();

	let editProfile: ProfileOptions = $state({
		first_name: '',
		last_name: '',
		grading_system: 'percentage'
	});

	// Init local state when profile changes or opens
	$effect(() => {
		if (profile) {
			editProfile = {
				first_name: profile.first_name || '',
				last_name: profile.last_name || '',
				grading_system: profile.grading_system || 'percentage'
			};
		}
	});

	function handleSave() {
		onSave(editProfile);
	}
</script>

{#if isActive}
	<div
		class="fixed inset-0 z-50 h-full w-full overflow-y-auto sm:absolute sm:inset-0 sm:z-20 sm:overflow-visible"
	>
		<PostItView title="Options" variant="green" {onClose} id="options" {send} {receive}>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
				<!-- Identité -->
				<div
					class="rotate-1 rounded-lg border border-green-200 bg-white/40 p-6 shadow-sm md:rotate-1"
				>
					<h3 class="font-hand mb-4 text-xl font-bold text-green-800">Identité</h3>
					<div class="space-y-4">
						<div>
							<label for="lastname" class="font-hand mb-1 block text-gray-500">Nom</label>
							<input
								type="text"
								id="lastname"
								bind:value={editProfile.last_name}
								class="font-hand w-full border-b-2 border-dashed border-green-300 bg-transparent text-2xl text-green-900 focus:border-green-500 focus:outline-none"
							/>
						</div>
						<div>
							<label for="firstname" class="font-hand mb-1 block text-gray-500">Prénom</label>
							<input
								type="text"
								id="firstname"
								bind:value={editProfile.first_name}
								class="font-hand w-full border-b-2 border-dashed border-green-300 bg-transparent text-2xl text-green-900 focus:border-green-500 focus:outline-none"
							/>
						</div>
					</div>
				</div>

				<!-- Notation -->
				<div class="space-y-6">
					<div class="-rotate-1 rounded-lg border border-green-200 bg-white/40 p-6 shadow-sm">
						<h3 class="font-hand mb-4 text-xl font-bold text-green-800">Système de notation</h3>
						<p class="font-hand mb-4 text-sm text-gray-600">
							Ce choix sera proposé par défaut lors de la saisie des notes.
						</p>

						<div class="space-y-3">
							<label class="flex cursor-pointer items-center gap-3">
								<input
									type="radio"
									bind:group={editProfile.grading_system}
									value="percentage"
									class="h-5 w-5 text-green-600 focus:ring-green-500"
								/>
								<span class="font-hand text-xl text-green-900">Pourcentage (%)</span>
							</label>

							<label class="flex cursor-pointer items-center gap-3">
								<input
									type="radio"
									bind:group={editProfile.grading_system}
									value="color"
									class="h-5 w-5 text-green-600 focus:ring-green-500"
								/>
								<span class="font-hand text-xl text-green-900">Couleurs (Vert/Rouge...)</span>
							</label>

							<label class="flex cursor-pointer items-center gap-3">
								<input
									type="radio"
									bind:group={editProfile.grading_system}
									value="letter"
									class="h-5 w-5 text-green-600 focus:ring-green-500"
								/>
								<span class="font-hand text-xl text-green-900">Lettres (A, B, C...)</span>
							</label>
						</div>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex justify-end md:col-span-2">
					<button
						onclick={handleSave}
						disabled={saving}
						class="font-hand rounded-full bg-green-600 px-8 py-3 text-xl text-white shadow-lg transition-transform hover:scale-105 hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{saving ? 'Sauvegarde...' : 'Sauvegarder'}
					</button>
				</div>
			</div>
		</PostItView>
	</div>
{:else}
	<!-- Post-it fermé -->
	<div class="relative z-10 w-full transition-all duration-300 sm:w-80">
		<PostIt
			variant="green"
			rotate={2}
			class="h-64 cursor-pointer shadow-md transition-all sm:hover:rotate-0 sm:hover:scale-105 sm:hover:shadow-xl"
			onclick={onOpen}
			id="options"
			{send}
			{receive}
		>
			<div class="flex h-full flex-col items-center justify-center p-4 text-center">
				<h3 class="font-hand mb-2 text-3xl font-bold text-green-900">Options</h3>
				<div class="my-2 w-16 border-t-2 border-dashed border-green-300"></div>
				<p class="font-hand text-xl text-green-800 opacity-80">
					Mon profil &<br />Mes préférences
				</p>
				<div class="mt-4 text-4xl opacity-50">⚙️</div>
			</div>
		</PostIt>
	</div>
{/if}
