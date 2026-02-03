<script lang="ts">
	import PostIt from '$lib/components/ui/PostIt.svelte';
	import PostItView from '$lib/components/ma-classe/PostItView.svelte';
	import Doodle from '$lib/components/ui/Doodle.svelte';
	import type { TransitionConfig } from 'svelte/transition';
	import type { Student, Contact } from '$lib/types';
	import { slide } from 'svelte/transition';

	interface Props {
		isActive: boolean;
		onOpen: () => void;
		onClose: () => void;
		student: Student;
		onSave: () => Promise<void>;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		send: (node: Element, params: any) => TransitionConfig | (() => TransitionConfig);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		receive: (node: Element, params: any) => TransitionConfig | (() => TransitionConfig);
	}

	let { isActive, onOpen, onClose, student = $bindable(), onSave, send, receive }: Props = $props();

	function addContact() {
		if (!student.contacts) {
			student.contacts = [];
		}
		student.contacts.push({
			id: crypto.randomUUID(),
			firstName: '',
			lastName: '',
			relationship: 'Mère',
			email: '',
			phone: ''
		});
		student.contacts = student.contacts;
	}

	const relationships = [
		'Mère',
		'Père',
		'Belle-mère',
		'Beau-père',
		'Grand-mère',
		'Grand-père',
		'Tante',
		'Oncle',
		'Sœur',
		'Frère',
		'Tuteur',
		'Tutrice',
		'Educateur',
		'Educatrice',
		'Autre'
	];

	function removeContact(index: number) {
		if (!student.contacts) return;
		student.contacts.splice(index, 1);
		student.contacts = student.contacts;
		save();
	}

	async function save() {
		await onSave();
	}
</script>

{#if isActive}
	<div class="absolute inset-0 z-20">
		<PostItView title="Famille & Contacts" variant="green" {onClose} id="family" {send} {receive}>
			{#snippet actions()}
				<button
					onclick={save}
					class="font-hand rounded-full bg-green-100 px-4 py-1 text-lg font-bold text-green-700 hover:bg-green-200"
				>
					Sauvegarder
				</button>
			{/snippet}

			<div class="grid grid-cols-1 gap-8">
				<div class="rounded-lg border border-green-200 bg-white/40 p-6 shadow-sm">
					<div class="mb-4 flex items-center justify-between">
						<h3 class="font-hand text-xl font-bold text-green-800">
							Contacts Parents / Responsables
						</h3>
					</div>

					<div class="space-y-4">
						{#if student.contacts && student.contacts.length > 0}
							{#each student.contacts as contact, i}
								<div
									transition:slide|local
									class="relative rounded-md bg-white/50 p-2 shadow-sm transition-all hover:bg-white/80"
								>
									<div class="flex flex-wrap items-center gap-2">
										<div class="min-w-[120px] flex-1">
											<select
												class="font-hand w-full border-none bg-transparent p-1 text-base font-bold text-green-700 focus:ring-0"
												bind:value={contact.relationship}
											>
												<option value="" disabled selected>Lien</option>
												{#each relationships as type}
													<option value={type}>{type}</option>
												{/each}
											</select>
										</div>
										<div class="min-w-[100px] flex-1">
											<input
												type="text"
												placeholder="Nom"
												class="font-hand w-full border-none bg-transparent p-1 text-base text-gray-800 placeholder-gray-400 focus:ring-0"
												bind:value={contact.lastName}
											/>
										</div>
										<div class="min-w-[100px] flex-1">
											<input
												type="text"
												placeholder="Prénom"
												class="font-hand w-full border-none bg-transparent p-1 text-base text-gray-800 placeholder-gray-400 focus:ring-0"
												bind:value={contact.firstName}
											/>
										</div>
										<div class="min-w-[150px] flex-[1.5]">
											<input
												type="email"
												placeholder="Email"
												class="font-hand w-full border-none bg-transparent p-1 text-base text-gray-600 placeholder-gray-400 focus:ring-0"
												bind:value={contact.email}
											/>
										</div>
										<div class="min-w-[120px] flex-1">
											<input
												type="tel"
												placeholder="Téléphone"
												class="font-hand w-full border-none bg-transparent p-1 text-base text-gray-600 placeholder-gray-400 focus:ring-0"
												bind:value={contact.phone}
											/>
										</div>
										<button
											class="flex h-8 w-8 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
											title="Supprimer"
											onclick={() => removeContact(i)}
										>
											✕
										</button>
									</div>
								</div>
							{/each}
						{:else}
							<div class="font-hand py-4 text-center italic text-gray-400">
								Aucun contact enregistré
							</div>
						{/if}

						<button
							onclick={addContact}
							class="font-hand flex w-full items-center justify-center rounded-md border-2 border-dashed border-green-300 p-2 text-green-600 transition-colors hover:border-green-500 hover:bg-green-50 hover:text-green-700"
						>
							+ Ajouter un contact
						</button>
					</div>
				</div>

				<div class="rounded-lg border border-yellow-200 bg-yellow-50/50 p-6 shadow-sm">
					<h3 class="font-hand mb-4 text-xl font-bold text-yellow-800">
						Historique Liaison (Visas)
					</h3>
					<div class="font-hand pb-2 italic text-gray-500">Dernier mot signé le...</div>
				</div>
			</div>
		</PostItView>
	</div>
{:else}
	<div class="absolute right-20 top-20 z-10 w-72">
		<PostIt
			variant="green"
			rotate={4}
			class="h-64 cursor-pointer shadow-md transition-all hover:rotate-0 hover:scale-105 hover:shadow-xl"
			onclick={onOpen}
			id="family"
			{send}
			{receive}
		>
			<div class="flex h-full flex-col items-center justify-center p-4 text-center">
				{#if student.contacts && student.contacts.length > 0}
					<div class="font-hand mb-2 flex flex-col items-center">
						<span class="text-2xl font-bold text-green-900">
							{student.contacts[0].relationship || 'Contact'}
						</span>
						<span class="text-xl text-green-800">
							{student.contacts[0].firstName}
							{student.contacts[0].lastName}
						</span>
						<span class="mt-2 text-lg font-bold text-green-700">
							{student.contacts[0].phone}
						</span>
					</div>
				{:else}
					<Doodle type="star" class="mb-4 h-16 w-16 text-green-500" />
					<h3 class="font-hand text-3xl font-bold text-green-900">Famille</h3>
					<p class="font-hand mt-2 text-lg text-green-700">Contacts & Mots</p>
				{/if}
			</div>
		</PostIt>
	</div>
{/if}
