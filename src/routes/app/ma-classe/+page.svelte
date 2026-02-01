<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { get } from 'svelte/store';
	import { supabase } from '$lib/supabase';
	import { encryptionKey, encryptData, decryptData } from '$lib/crypto';
	import { notifications } from '$lib/stores/notifications';
	import StickerButton from '$lib/components/ui/StickerButton.svelte';
	import HandwrittenSelect from '$lib/components/ui/HandwrittenSelect.svelte';
	import StudentList from '$lib/components/ma-classe/StudentList.svelte';
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

<div class="px-0 sm:px-4">
	<div
		class="mb-8 flex flex-col space-y-4 sm:flex-row sm:items-end sm:justify-between sm:space-y-0"
	>
		<div>
			<h1 class="origin-bottom-left transform -rotate-1 font-hand text-5xl font-bold text-ink">
				Ma Classe
			</h1>
			<p class="ml-4 mt-2 font-hand text-xl text-gray-500">Le registre de mes élèves</p>
		</div>
		<div class="flex items-center space-x-4">
			<div class="transform rotate-2 border border-yellow-200 bg-yellow-100 px-3 py-1 shadow-sm">
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
			class="mx-auto mb-6 max-w-lg transform -rotate-1 border-l-4 border-red-400 bg-red-100 p-4 shadow-sm"
		>
			<div class="flex">
				<div class="flex-shrink-0">
					<span class="text-2xl">⚠️</span>
				</div>
				<div class="ml-3">
					<h3 class="font-hand text-lg font-bold text-red-800">Attention !</h3>
					<div class="mt-1 font-hand text-lg text-red-700">
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
		/>
	</div>

	{#if loading && students.length === 0}
		<div class="flex flex-col items-center justify-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
			<p class="font-hand text-2xl text-gray-400 animate-pulse">Ouverture du registre...</p>
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
