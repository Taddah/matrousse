<script lang="ts">
	import type { Student } from '$lib/types';
	import PostIt from '$lib/components/ui/PostIt.svelte';
	import PostItView from '$lib/components/ma-classe/PostItView.svelte';
	import Doodle from '$lib/components/ui/Doodle.svelte';
	import type { TransitionConfig } from 'svelte/transition';

	interface Props {
		student: Student;
		isActive: boolean;
		onOpen: () => void;
		onClose: () => void;
		onSave: () => void;
		saving: boolean;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		send: (node: Element, params: any) => TransitionConfig | (() => TransitionConfig);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		receive: (node: Element, params: any) => TransitionConfig | (() => TransitionConfig);
	}

	let {
		student = $bindable(),
		isActive,
		onOpen,
		onClose,
		onSave,
		saving,
		send,
		receive
	}: Props = $props();
</script>

{#if isActive}
	<div class="absolute inset-0 z-20">
		<PostItView title="Profil & Santé" variant="blue" {onClose} id="profile" {send} {receive}>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
				<div class="rotate-1 rounded-lg border border-blue-200 bg-white/40 p-6 shadow-sm">
					<h3 class="font-hand mb-4 text-xl font-bold text-blue-800">Identité</h3>
					<div class="space-y-4">
						<div>
							<label for="lastname" class="font-hand mb-1 block text-gray-500">Nom</label>
							<input
								type="text"
								id="lastname"
								bind:value={student.lastName}
								class="font-hand w-full border-b-2 border-dashed border-blue-300 bg-transparent text-2xl text-blue-900 focus:border-blue-500 focus:outline-none"
							/>
						</div>
						<div>
							<label for="firstname" class="font-hand mb-1 block text-gray-500">Prénom</label>
							<input
								type="text"
								id="firstname"
								bind:value={student.firstName}
								class="font-hand w-full border-b-2 border-dashed border-blue-300 bg-transparent text-2xl text-blue-900 focus:border-blue-500 focus:outline-none"
							/>
						</div>
						<div class="flex gap-4">
							<div class="flex-1">
								<label for="birthdate" class="font-hand mb-1 block text-gray-500"
									>Date de naissance</label
								>
								<input
									type="date"
									id="birthdate"
									bind:value={student.birthDate}
									class="font-hand w-full border-b-2 border-dashed border-blue-300 bg-transparent text-xl text-blue-900 focus:border-blue-500 focus:outline-none"
								/>
							</div>
							<div class="flex-1">
								<label for="grade" class="font-hand mb-1 block text-gray-500">Niveau</label>
								<select
									id="grade"
									bind:value={student.grade}
									class="font-hand w-full border-b-2 border-dashed border-blue-400 bg-transparent text-2xl text-blue-900 focus:border-blue-500 focus:outline-none"
								>
									<option value="CP">CP</option>
									<option value="CE1">CE1</option>
									<option value="CE2">CE2</option>
									<option value="CM1">CM1</option>
									<option value="CM2">CM2</option>
								</select>
							</div>
						</div>
					</div>
				</div>

				<div class="space-y-6">
					<div class="-rotate-1 rounded-lg border border-red-200 bg-red-50/50 p-6 shadow-sm">
						<h3 class="font-hand mb-4 text-xl font-bold text-red-700">Informations Générales</h3>
						<textarea
							class="font-hand h-64 w-full resize-none border-none bg-transparent text-xl leading-relaxed text-gray-700 placeholder-red-300 focus:ring-0"
							placeholder="Notes importantes, santé, allergies, ou autres points d'attention..."
							bind:value={student.generalInfo}
							style="background-image: linear-gradient(transparent, transparent 31px, #fecaca 31px, #fecaca 32px); background-size: 100% 32px; line-height: 32px;"
						></textarea>
					</div>
				</div>

				<div class="flex justify-end md:col-span-2">
					<button
						onclick={onSave}
						disabled={saving}
						class="font-hand rounded-full bg-blue-600 px-8 py-3 text-xl text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{saving ? 'Sauvegarde...' : 'Sauvegarder'}
					</button>
				</div>
			</div>
		</PostItView>
	</div>
{:else}
	<div class="absolute left-10 top-10 z-10 w-80">
		<PostIt
			variant="blue"
			rotate={-3}
			class="h-64 cursor-pointer shadow-md transition-all hover:rotate-0 hover:scale-105 hover:shadow-xl"
			onclick={onOpen}
			id="profile"
			{send}
			{receive}
		>
			<div class="flex h-full flex-col items-center justify-center p-4 text-center">
				<div class="mb-2 flex items-center justify-center gap-2">
					<Doodle type="smiley" class="h-8 w-8 text-blue-400" />
					<h3 class="font-hand text-xl font-bold text-blue-900">Profil & Santé</h3>
				</div>

				<div class="my-2 w-full border-t border-dashed border-blue-300"></div>

				<h3 class="font-hand mt-2 text-3xl font-bold text-blue-900">{student.firstName}</h3>
				<h3 class="font-hand mb-3 text-2xl font-bold uppercase text-blue-800">
					{student.lastName}
				</h3>
				<div
					class="font-hand inline-block rounded-full border-2 border-blue-400 bg-white/50 px-4 py-0.5 text-xl font-bold text-blue-600"
				>
					{student.grade}
				</div>
			</div>
		</PostIt>
	</div>
{/if}
