<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { loadSharedSession, saveGuestNote } from '$lib/services/share';
	import StudentList from '$lib/components/ma-classe/StudentList.svelte';
	import StudentDetailBoard from '$lib/components/ma-classe/StudentDetailBoard.svelte';
	import InfoPopup from '$lib/components/ui/InfoPopup.svelte';
	import StickerButton from '$lib/components/ui/StickerButton.svelte';
	import type { Student } from '$lib/types';
	import { SvelteSet } from 'svelte/reactivity';
	import { notifications } from '$lib/stores/notifications';

	let loading = $state(true);
	let error = $state<string | null>(null);
	let students = $state<Student[]>([]);
	let selectedStudent = $state<Student | null>(null);
	let recipientName = $state<string>('');

	// Dummy vars for StudentList
	let newStudents = $state([]);
	let selectedIds = $state([]);
	let sortField: 'lastName' | 'firstName' | 'grade' | null = $state('lastName');
	let sortDirection: 'asc' | 'desc' = $state('asc');

	let shareKey: CryptoKey | null = null;
	let originalEntryIds = new SvelteSet<string>();

	onMount(async () => {
		try {
			const id = $page.params.id ?? '';
			const hash = window.location.hash.substring(1); // Remove '#'

			const sessionData = await loadSharedSession(id, hash);

			students = sessionData.students;
			recipientName = sessionData.recipientName;
			shareKey = sessionData.shareKey;
			originalEntryIds = new SvelteSet(sessionData.originalEntryIds);
		} catch (err: unknown) {
			console.error(err);
			error = err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement.';
		} finally {
			loading = false;
		}
	});

	async function handleGuestSave() {
		if (!selectedStudent || !shareKey) return;

		const newEntries = (selectedStudent.journalEntries || []).filter(
			(e) => !originalEntryIds.has(e.id)
		);

		for (const entry of newEntries) {
			try {
				await saveGuestNote(
					$page.params.id ?? '',
					selectedStudent.id,
					entry.content,
					shareKey,
					recipientName
				);
				// Mark as saved so we don't save again
				originalEntryIds.add(entry.id);
			} catch (e) {
				console.error('Error saving note', e);
				notifications.send('Erreur lors de la sauvegarde de la note.', 'error');
			}
		}
	}

	function handleSort(field: 'lastName' | 'firstName' | 'grade') {
		if (sortField === field) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortDirection = 'asc';
		}
		sortStudents();
	}

	function sortStudents() {
		students.sort((a, b) => {
			const valA = a[sortField!]?.toLowerCase() ?? '';
			const valB = b[sortField!]?.toLowerCase() ?? '';
			if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
			if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
		students = students; // Trigger update
	}

	function handleStudentClick(id: string) {
		selectedStudent = students.find((s) => s.id === id) || null;
	}
</script>

<svelte:head>
	<title>Partage sécurisé - Ma Trousse</title>
</svelte:head>

<div class="min-h-screen bg-[#fdfbf7] p-4 font-sans text-gray-900 sm:p-8">
	<div class="mx-auto max-w-6xl">
		<header
			class="mb-8 flex flex-col items-center justify-between gap-4 border-b-2 border-indigo-100 pb-4 sm:flex-row"
		>
			<div class="flex flex-wrap items-center gap-4">
				<h1 class="font-hand text-3xl font-bold text-indigo-900">Ma Trousse 🎓</h1>

				<div
					class="flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-indigo-100"
				>
					<span
						class="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-yellow-800"
					>
						Invité
					</span>
					{#if recipientName}
						<span class="font-hand text-lg font-bold text-indigo-800">{recipientName}</span>
					{/if}
				</div>

				<InfoPopup title="Mode Invité Sécurisé">
					<p class="mb-2">Vous consultez une vue restreinte et sécurisée.</p>
					<p>
						Les données ont été déchiffrées localement dans votre navigateur grâce au lien unique
						que l'on vous a envoyé.
					</p>
				</InfoPopup>
			</div>

			<div class="flex items-center gap-4">
				{#if selectedStudent}
					<StickerButton variant="indigo" onclick={() => (selectedStudent = null)}>
						← Retour liste
					</StickerButton>
				{/if}
			</div>
		</header>

		<main>
			{#if loading}
				<div class="flex flex-col items-center justify-center py-20">
					<div class="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
					<p class="font-hand animate-pulse text-2xl text-gray-400">Déchiffrement en cours...</p>
				</div>
			{:else if error}
				<div class="mx-auto max-w-lg rounded-lg bg-red-50 p-6 text-center shadow-lg">
					<div class="mb-4 text-4xl">🌵</div>
					<h2 class="font-hand mb-2 text-2xl font-bold text-red-800">C'est la panne !</h2>
					<p class="text-red-700">{error}</p>
				</div>
			{:else if selectedStudent}
				<StudentDetailBoard
					bind:student={selectedStudent}
					isReadOnly={true}
					{recipientName}
					onSave={handleGuestSave}
				/>
			{:else}
				<div class="mb-6">
					<h2 class="font-hand text-2xl text-gray-700">
						Voici les fiches partagées ({students.length})
					</h2>
				</div>

				<div class="rounded-xl bg-white p-1 shadow-xl ring-1 ring-black/5 sm:p-6">
					<StudentList
						visibleStudents={students}
						bind:newStudents
						grades={[]}
						errorMessage={null}
						handwritingInputClass=""
						errorHandwritingInputClass=""
						{sortField}
						{sortDirection}
						onToggleSort={handleSort}
						onInput={() => {}}
						bind:selectedIds
						onRowClick={handleStudentClick}
						showCheckboxes={false}
					/>
				</div>
			{/if}
		</main>
	</div>
</div>
