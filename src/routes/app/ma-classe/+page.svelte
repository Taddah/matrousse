<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { get } from 'svelte/store';
	import { supabase } from '$lib/supabase';
	import { encryptionKey, encryptData, decryptData } from '$lib/crypto';
	import { notifications } from '$lib/stores/notifications';
	import StickerButton from '$lib/components/ui/StickerButton.svelte';
	import HandwrittenSelect from '$lib/components/ui/HandwrittenSelect.svelte';
	import StudentList from '$lib/components/ma-classe/StudentList.svelte';
	import InfoPopup from '$lib/components/ui/InfoPopup.svelte';
	import type { Student } from '$lib/types';

	let { data } = $props();

	let students: Student[] = $state([]);
	let loading = $state(true);

	let sortField: 'lastName' | 'firstName' | 'grade' | null = $state(null);
	let sortDirection: 'asc' | 'desc' = $state('asc');

	let filterGrade: string = $state('all');

	let errorMessage: string | null = $state(null);

	let newStudents: Omit<Student, 'id'>[] = $state([{ lastName: '', firstName: '', grade: 'CP' }]);

	const grades = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'];
	const filterOptions = [
		{ value: 'all', label: "Toute l'école" },
		...grades.map((g) => ({ value: g, label: g }))
	];

	const handwritingInputClass =
		'block w-full bg-transparent border-0 border-b-2 border-dashed border-gray-400 focus:border-indigo-600 focus:ring-0 font-hand text-xl text-ink placeholder-gray-400 px-2 py-1 transition-colors';
	const errorHandwritingInputClass =
		'block w-full bg-red-50 border-0 border-b-2 border-red-400 focus:border-red-600 focus:ring-0 font-hand text-xl text-red-800 placeholder-red-300 px-2 py-1';

	let visibleStudents = $derived(
		filterAndSortStudents(students, filterGrade, sortField, sortDirection)
	);
	let totalStudentsCount = $derived(students.length + (newStudents.length - 1));
	let hasUnsavedChanges = $derived(
		newStudents.length > 1 || isStudentDirty(newStudents[newStudents.length - 1])
	);

	$effect(() => {
		if (data.students && data.students.length === 0) {
			loading = false;
			return;
		}

		const key = get(encryptionKey);
		if (key && data.students) {
			decryptStudents(data.students, key);
		}
	});

	async function decryptStudents(
		encryptedList: { id: string; encrypted_data: string }[],
		key: CryptoKey
	) {
		loading = true;
		const decryptedList: Student[] = [];
		for (const row of encryptedList) {
			try {
				const info = (await decryptData(row.encrypted_data, key)) as Omit<Student, 'id'>;
				decryptedList.push({
					id: row.id,
					...info
				});
			} catch {
				console.error('Failed to decrypt row', row.id);
			}
		}

		students = decryptedList;
		loading = false;
	}

	function isStudentDirty(student: Omit<Student, 'id'>) {
		return student.lastName !== '' || student.firstName !== '';
	}

	function handleInput(index: number) {
		if (errorMessage) errorMessage = null;

		if (index === newStudents.length - 1 && isStudentDirty(newStudents[index])) {
			newStudents = [...newStudents, { lastName: '', firstName: '', grade: 'CP' }];
		}
	}

	async function handleSave() {
		const rowsToSave = newStudents.slice(0, newStudents.length - 1);
		const key = get(encryptionKey);

		if (!key) {
			errorMessage = 'Clé de chiffrement manquante.';
			return;
		}

		let hasError = false;
		rowsToSave.forEach((student) => {
			if (!student.lastName.trim() || !student.firstName.trim()) {
				hasError = true;
			}
		});

		if (hasError) {
			errorMessage = 'Oups ! Il manque des prénoms ou des noms (écrit en rouge).';
			return;
		}

		if (!data.session?.user) {
			errorMessage = 'Utilisateur non connecté.';
			return;
		}

		loading = true;
		try {
			for (const student of rowsToSave) {
				const encrypted = await encryptData(student, key);

				const { error } = await supabase.from('students').insert({
					user_id: data.session.user.id,
					encrypted_data: encrypted
				});

				if (error) throw error;
			}

			await invalidateAll();

			notifications.send(
				`C'est noté ! ${rowsToSave.length} élèves cryptés et ajoutés au registre.`,
				'success'
			);
			newStudents = [{ lastName: '', firstName: '', grade: 'CP' }];
		} catch {
			notifications.send('Erreur lors de la sauvegarde.', 'error');
			errorMessage = 'Erreur lors de la sauvegarde.';
		} finally {
			loading = false;
		}
	}

	function filterAndSortStudents(
		list: Student[],
		filter: string,
		field: 'lastName' | 'firstName' | 'grade' | null,
		direction: 'asc' | 'desc'
	) {
		let result = [...list];

		if (filter !== 'all') {
			result = result.filter((s) => s.grade === filter);
		}

		if (field) {
			result.sort((a, b) => {
				const valA = a[field].toLowerCase();
				const valB = b[field].toLowerCase();
				if (valA < valB) return direction === 'asc' ? -1 : 1;
				if (valA > valB) return direction === 'asc' ? 1 : -1;
				return 0;
			});
		}

		return result;
	}

	function toggleSort(field: 'lastName' | 'firstName' | 'grade') {
		if (sortField === field) {
			if (sortDirection === 'asc') {
				sortDirection = 'desc';
			} else {
				sortField = null;
				sortDirection = 'asc';
			}
		} else {
			sortField = field;
			sortDirection = 'asc';
		}
	}
</script>

<svelte:head>
	<title>Ma Classe - Ma Trousse</title>
</svelte:head>

<div class="mx-auto max-w-6xl">
	<div
		class="mb-8 flex flex-col space-y-4 sm:flex-row sm:items-end sm:justify-between sm:space-y-0"
	>
		<div>
			<div class="mb-2 flex items-center gap-1">
				<h1 class="font-hand text-4xl font-bold text-indigo-900">Ma Classe 🎓</h1>
				<InfoPopup title="Mes données sont-elles protégées ?">
					<p class="mb-2">Absolument ! Cette page fonctionne comme un carnet personnel sécurisé.</p>
					<p class="mb-2">
						<strong>Tout est chiffré</strong> : Les données de vos élèves (noms, prénoms) sont chiffrées
						sur votre appareil avant d'être envoyées.
					</p>
					<p>
						<strong>Serveur aveugle</strong> : Le serveur ne reçoit que des suites de caractères incompréhensibles.
						Seul vous (avec votre clé) pouvez lire ces informations.
					</p>
				</InfoPopup>
			</div>
			<p class="font-hand text-lg text-stone-600">Le registre de mes élèves</p>
		</div>
		<div class="flex items-center space-x-4">
			<div class="rotate-2 transform border border-yellow-200 bg-yellow-100 px-3 py-1 shadow-sm">
				<span class="font-hand text-xl text-gray-700">
					{totalStudentsCount} élève{totalStudentsCount > 1 ? 's' : ''}
				</span>
			</div>
			<StickerButton onclick={handleSave} disabled={!hasUnsavedChanges || loading} variant="green">
				{loading ? 'Sauvegarde...' : 'Sauvegarder'}
			</StickerButton>
		</div>
	</div>

	{#if errorMessage}
		<div
			class="mx-auto mb-6 max-w-lg -rotate-1 transform border-l-4 border-red-400 bg-red-100 p-4 shadow-sm"
		>
			<div class="flex">
				<div class="flex-shrink-0">
					<span class="text-2xl">⚠️</span>
				</div>
				<div class="ml-3">
					<h3 class="font-hand text-lg font-bold text-red-800">Attention !</h3>
					<div class="font-hand mt-1 text-lg text-red-700">
						<p>{errorMessage}</p>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<div class="mb-6 flex items-center justify-end">
		<HandwrittenSelect
			id="filter-grade"
			label="Voir la classe :"
			bind:value={filterGrade}
			options={filterOptions}
			class="min-w-[250px]"
		/>
	</div>

	{#if loading && students.length === 0}
		<div class="flex flex-col items-center justify-center py-12">
			<div class="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
			<p class="font-hand animate-pulse text-2xl text-gray-400">Ouverture du registre...</p>
		</div>
	{:else}
		<StudentList
			{visibleStudents}
			bind:newStudents
			{grades}
			{errorMessage}
			{handwritingInputClass}
			{errorHandwritingInputClass}
			{sortField}
			{sortDirection}
			onToggleSort={toggleSort}
			onInput={handleInput}
		/>
	{/if}

	<div class="mt-8 flex justify-end">
		<StickerButton onclick={handleSave} disabled={!hasUnsavedChanges || loading} variant="green">
			{loading ? 'Sauvegarde...' : 'Sauvegarder'}
		</StickerButton>
	</div>
</div>
