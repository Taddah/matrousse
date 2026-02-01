<script lang="ts">
	interface Student {
		id: string;
		lastName: string;
		firstName: string;
		grade: 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2';
	}

	let students: Student[] = [
		{ id: '1', lastName: 'Dupont', firstName: 'Jean', grade: 'CM1' },
		{ id: '2', lastName: 'Martin', firstName: 'Alice', grade: 'CE2' },
		{ id: '3', lastName: 'Bernard', firstName: 'Lucas', grade: 'CM2' }
	];

	let sortField: 'lastName' | 'firstName' | 'grade' | null = $state(null);
	let sortDirection: 'asc' | 'desc' = $state('asc');

	let filterGrade: string = $state('all');

	let errorMessage: string | null = $state(null);

	let newStudents: Omit<Student, 'id'>[] = $state([{ lastName: '', firstName: '', grade: 'CP' }]);

	const inputClass =
		'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2';
	const errorInputClass =
		'block w-full rounded-md border-red-300 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm px-3 py-2';
	const grades = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'];

	let visibleStudents = $derived(() =>
		filterAndSortStudents(students, filterGrade, sortField, sortDirection)
	);
	let totalStudentsCount = $derived(() => students.length + (newStudents.length - 1)); // -1 because the last one is always empty/draft
	let hasUnsavedChanges = $derived(
		() => newStudents.length > 1 || isStudentDirty(newStudents[newStudents.length - 1])
	);

	function isStudentDirty(student: Omit<Student, 'id'>) {
		return student.lastName !== '' || student.firstName !== '';
	}

	function handleInput(index: number) {
		if (errorMessage) errorMessage = null;

		if (index === newStudents.length - 1 && isStudentDirty(newStudents[index])) {
			newStudents = [...newStudents, { lastName: '', firstName: '', grade: 'CP' }];
		}
	}

	function handleSave() {
		const rowsToSave = newStudents.slice(0, newStudents.length - 1);

		let hasError = false;
		rowsToSave.forEach((student) => {
			if (!student.lastName.trim() || !student.firstName.trim()) {
				hasError = true;
			}
		});

		if (hasError) {
			errorMessage =
				'Veuillez remplir le nom et le prénom pour tous les élèves avant de sauvegarder.';
			return;
		}

		alert(`Sauvegarde de ${rowsToSave.length} élèves !`);
		newStudents = [{ lastName: '', firstName: '', grade: 'CP' }];
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

	function getSortIcon(field: 'lastName' | 'firstName' | 'grade') {
		if (sortField !== field) return '↕';
		return sortDirection === 'asc' ? '↑' : '↓';
	}
</script>

<div class="px-4 py-6 sm:px-0">
	<div
		class="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
	>
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Ma Classe</h1>
			<p class="mt-1 text-sm text-gray-500">Gérez la liste de vos élèves.</p>
		</div>
		<div class="flex items-center space-x-4">
			<span class="text-sm text-gray-500">
				{totalStudentsCount} élève{totalStudentsCount() > 1 ? 's' : ''}
			</span>
			<button
				onclick={handleSave}
				disabled={!hasUnsavedChanges}
				class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
			>
				Sauvegarder
			</button>
		</div>
	</div>

	{#if errorMessage}
		<div class="mb-4 rounded-md bg-red-50 p-4">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg
						class="h-5 w-5 text-red-400"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<div class="ml-3">
					<h3 class="text-sm font-medium text-red-800">Erreur de validation</h3>
					<div class="mt-2 text-sm text-red-700">
						<p>{errorMessage}</p>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<div class="mb-4 flex items-center justify-between">
		<div class="flex items-center space-x-2">
			<label for="filter-grade" class="block text-sm font-medium text-gray-700"
				>Filtrer par classe :</label
			>
			<select
				id="filter-grade"
				bind:value={filterGrade}
				class="block rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
			>
				<option value="all">Toutes les classes</option>
				{#each grades as grade}
					<option value={grade}>{grade}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5">
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-300">
				<thead class="bg-gray-50">
					<tr>
						<th
							scope="col"
							class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer hover:bg-gray-100 select-none"
							onclick={() => toggleSort('lastName')}
						>
							<div class="flex items-center gap-1">
								Nom <span class="text-gray-400 font-normal">{getSortIcon('lastName')}</span>
							</div>
						</th>
						<th
							scope="col"
							class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 select-none"
							onclick={() => toggleSort('firstName')}
						>
							<div class="flex items-center gap-1">
								Prénom <span class="text-gray-400 font-normal">{getSortIcon('firstName')}</span>
							</div>
						</th>
						<th
							scope="col"
							class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 select-none"
							onclick={() => toggleSort('grade')}
						>
							<div class="flex items-center gap-1">
								Classe <span class="text-gray-400 font-normal">{getSortIcon('grade')}</span>
							</div>
						</th>
						<th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
							<span class="sr-only">Actions</span>
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each visibleStudents() as student (student.id)}
						<tr class="hover:bg-gray-50 transition-colors cursor-pointer group">
							<td
								class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 group-hover:text-indigo-600 transition-colors"
							>
								{student.lastName}
							</td>
							<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
								{student.firstName}
							</td>
							<td class="whitespace-nowrap px-3 py-4 text-sm">
								<span
									class="inline-flex rounded-full bg-indigo-100 px-2 text-xs font-semibold leading-5 text-indigo-800"
								>
									{student.grade}
								</span>
							</td>
							<td
								class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
							>
								<span
									class="text-indigo-600 hover:text-indigo-900 opacity-0 group-hover:opacity-100 transition-opacity"
									>Voir détails</span
								>
							</td>
						</tr>
					{/each}

					{#each newStudents as newStudent, i}
						<tr class="bg-gray-50 transition-all duration-300 ease-in-out">
							<td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
								<input
									type="text"
									bind:value={newStudent.lastName}
									oninput={() => handleInput(i)}
									placeholder="Nom"
									class={errorMessage && i < newStudents.length - 1 && !newStudent.lastName
										? errorInputClass
										: inputClass}
								/>
							</td>
							<td class="whitespace-nowrap px-3 py-4 text-sm">
								<input
									type="text"
									bind:value={newStudent.firstName}
									oninput={() => handleInput(i)}
									placeholder="Prénom"
									class={errorMessage && i < newStudents.length - 1 && !newStudent.firstName
										? errorInputClass
										: inputClass}
								/>
							</td>
							<td class="whitespace-nowrap px-3 py-4 text-sm">
								<select bind:value={newStudent.grade} class={inputClass}>
									{#each grades as grade}
										<option value={grade}>{grade}</option>
									{/each}
								</select>
							</td>
							<td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
							></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<div class="mt-4 flex justify-end">
		<button
			onclick={handleSave}
			disabled={!hasUnsavedChanges}
			class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
		>
			Sauvegarder
		</button>
	</div>
</div>
