<script lang="ts">
	import type { Student, JournalEntry } from '$lib/types';
	import PostIt from '$lib/components/ui/PostIt.svelte';
	import PostItView from '$lib/components/ma-classe/PostItView.svelte';
	import Doodle from '$lib/components/ui/Doodle.svelte';
	import PaperModal from '$lib/components/ui/PaperModal.svelte';
	import JournalEntryComponent from '$lib/components/ma-classe/post-its/JournalEntry.svelte';
	import type { TransitionConfig } from 'svelte/transition';
	import { SvelteMap } from 'svelte/reactivity';

	interface Props {
		student: Student;
		isActive: boolean;
		onOpen: () => void;
		onClose: () => void;
		onSave: () => void;
		send: (node: Element, params: { key: unknown }) => TransitionConfig | (() => TransitionConfig);
		receive: (
			node: Element,
			params: { key: unknown }
		) => TransitionConfig | (() => TransitionConfig);
		recipientName?: string;
		isReadOnly?: boolean;
	}

	let {
		student = $bindable(),
		isActive,
		onOpen,
		onClose,
		onSave,
		send,
		receive,
		recipientName = '',
		isReadOnly = false
	}: Props = $props();

	let newEntryText = $state('');
	let showDeleteModal = $state(false);
	let entryToDelete: string | null = $state(null);

	let sortedEntries = $derived.by(() => {
		const unique = new SvelteMap<string, JournalEntry>();
		(student.journalEntries || []).forEach((e) => unique.set(e.id, e));
		return Array.from(unique.values()).sort((a, b) => {
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		});
	});

	function addEntry() {
		if (!newEntryText.trim()) return;

		const now = new Date();
		let content = newEntryText;

		if (recipientName) {
			content += `\n\n(Auteur : ${recipientName})`;
		}

		const newEntry: JournalEntry = {
			id: crypto.randomUUID(),
			content,
			date: now.toISOString(),
			updatedAt: now.toISOString()
		};

		student.journalEntries = [newEntry, ...(student.journalEntries || [])];
		newEntryText = '';
		onSave();
	}

	function confirmDelete(id: string) {
		entryToDelete = id;
		showDeleteModal = true;
	}

	function deleteEntry() {
		if (entryToDelete) {
			student.journalEntries = (student.journalEntries || []).filter((e) => e.id !== entryToDelete);
			entryToDelete = null;
			showDeleteModal = false;
			onSave();
		}
	}

	function handleEntryChange(id: string, newContent: string) {
		student.journalEntries = (student.journalEntries || []).map((e) =>
			e.id === id ? { ...e, content: newContent } : e
		);
		onSave();
	}
</script>

{#if isActive}
	<div class="absolute inset-0 z-20">
		<PostItView title="Journal de Bord" variant="purple" {onClose} id="journal" {send} {receive}>
			<div class="flex h-full flex-col">
				<div class="flex-1 overflow-y-auto px-4">
					<div class="relative space-y-8 py-4">
						<div class="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-purple-300"></div>
						<div class="relative flex w-full items-start justify-start">
							<div
								class="absolute left-1/2 top-4 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-purple-500 shadow"
							></div>
							<div class="font-hand absolute left-1/2 top-4 ml-6 text-sm text-gray-500">
								Maintenant
							</div>
							<div class="group relative w-[45%]">
								<div
									class="rounded-lg border-2 border-dashed border-purple-300 bg-white/50 p-3 shadow-sm transition-colors focus-within:border-purple-500 focus-within:bg-white focus-within:shadow-md hover:bg-white"
								>
									<textarea
										bind:value={newEntryText}
										placeholder="Écrire ici..."
										class="font-hand min-h-[60px] w-full resize-none border-none bg-transparent p-0 text-xl text-gray-700 placeholder-purple-300 focus:ring-0"
										aria-label="Nouvelle entrée de journal"
									></textarea>
									{#if newEntryText.trim()}
										<div class="mt-2 flex justify-end">
											<button
												onclick={addEntry}
												class="font-hand rounded-full bg-purple-500 px-3 py-1 text-sm text-white shadow hover:bg-purple-600"
											>
												Ajouter
											</button>
										</div>
									{/if}
								</div>
							</div>
						</div>

						{#each sortedEntries as entry, i (entry.id)}
							{@const isLeft = (i + 1) % 2 === 0}
							<JournalEntryComponent
								{entry}
								{isLeft}
								onDelete={isReadOnly ? undefined : confirmDelete}
								onChange={isReadOnly ? undefined : handleEntryChange}
							/>
						{/each}
					</div>
				</div>
			</div>
		</PostItView>

		<PaperModal
			isOpen={showDeleteModal}
			onClose={() => (showDeleteModal = false)}
			title="Supprimer la note ?"
			variant="pink"
		>
			<div class="flex flex-col items-center">
				<p class="font-hand mb-6 text-center text-xl">
					Voulez-vous vraiment supprimer cette observation ? Cette action est irréversible.
				</p>
				<div class="flex gap-4">
					<button
						class="font-hand rounded-full border-2 border-gray-300 bg-white px-6 py-2 text-lg text-gray-600 hover:bg-gray-50"
						onclick={() => (showDeleteModal = false)}
					>
						Annuler
					</button>
					<button
						class="font-hand rounded-full bg-red-500 px-6 py-2 text-lg text-white shadow hover:bg-red-600"
						onclick={deleteEntry}
					>
						Supprimer
					</button>
				</div>
			</div>
		</PaperModal>
	</div>
{:else}
	<div class="absolute bottom-10 right-40 z-10 w-72">
		<PostIt
			variant="purple"
			rotate={-5}
			class="h-64 cursor-pointer shadow-md transition-all hover:rotate-0 hover:scale-105 hover:shadow-xl"
			onclick={onOpen}
			id="journal"
			{send}
			{receive}
		>
			<div class="flex h-full flex-col items-center justify-center p-4 text-center">
				<Doodle type="underline" class="mb-2 h-6 w-20 text-purple-400" />
				<h3 class="font-hand text-2xl font-bold text-purple-900">Journal</h3>
				<div class="mt-1">
					<span
						class="font-hand rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-800"
					>
						{(student.journalEntries || []).length} commentaire{(student.journalEntries || [])
							.length > 1
							? 's'
							: ''}
					</span>
				</div>
				{#if sortedEntries.length > 0}
					<div class="mt-3 w-full border-t border-dashed border-purple-300 pt-2">
						<p class="font-hand line-clamp-3 text-sm italic text-gray-600">
							"{sortedEntries[0].content}"
						</p>
						<p class="font-hand mt-1 text-xs text-purple-400">
							{new Date(sortedEntries[0].date).toLocaleDateString('fr-FR', {
								day: 'numeric',
								month: 'short'
							})}
						</p>
					</div>
				{:else}
					<p class="font-hand mt-2 text-sm text-purple-400">Aucune observation</p>
				{/if}
			</div>
		</PostIt>
	</div>
{/if}
