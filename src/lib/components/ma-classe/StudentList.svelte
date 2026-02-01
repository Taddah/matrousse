<script lang="ts">
	import type { Student } from '$lib/types';

	interface Props {
		visibleStudents: Student[];
		newStudents: Omit<Student, 'id'>[];
		grades: string[];
		errorMessage: string | null;
		handwritingInputClass: string;
		errorHandwritingInputClass: string;
		sortField: 'lastName' | 'firstName' | 'grade' | null;
		sortDirection: 'asc' | 'desc';
		onToggleSort: (field: 'lastName' | 'firstName' | 'grade') => void;
		onInput: (index: number) => void;
	}

	let {
		visibleStudents,
		newStudents = $bindable(),
		grades,
		errorMessage,
		handwritingInputClass,
		errorHandwritingInputClass,
		sortField,
		sortDirection,
		onToggleSort,
		onInput
	}: Props = $props();

	function getSortIcon(field: 'lastName' | 'firstName' | 'grade') {
		if (sortField !== field) return '';
		return sortDirection === 'asc' ? '↓' : '↑';
	}
</script>

<div class="overflow-hidden">
	<div class="overflow-x-auto">
		<table class="min-w-full">
			<thead>
				<tr>
					<th
						scope="col"
						class="cursor-pointer select-none border-b-2 border-red-300 py-2 pl-4 pr-3 text-left font-hand text-xl font-bold text-gray-500 sm:pl-6"
						onclick={() => onToggleSort('lastName')}
					>
						<div class="group flex items-center gap-1">
							<span
								class="bg-yellow-100 px-2 transform -rotate-1 transition-colors group-hover:bg-yellow-200"
								>Nom</span
							>
							<span class="text-indigo-400">{getSortIcon('lastName')}</span>
						</div>
					</th>
					<th
						scope="col"
						class="cursor-pointer select-none border-b-2 border-red-300 px-3 py-2 text-left font-hand text-xl font-bold text-gray-500"
						onclick={() => onToggleSort('firstName')}
					>
						<div class="group flex items-center gap-1">
							<span
								class="bg-yellow-100 px-2 transform rotate-1 transition-colors group-hover:bg-yellow-200"
								>Prénom</span
							>
							<span class="text-indigo-400">{getSortIcon('firstName')}</span>
						</div>
					</th>
					<th
						scope="col"
						class="cursor-pointer select-none border-b-2 border-red-300 px-3 py-2 text-left font-hand text-xl font-bold text-gray-500"
						onclick={() => onToggleSort('grade')}
					>
						<div class="group flex items-center gap-1">
							<span class="bg-yellow-100 px-2 transition-colors group-hover:bg-yellow-200"
								>Classe</span
							>
							<span class="text-indigo-400">{getSortIcon('grade')}</span>
						</div>
					</th>
					<th scope="col" class="relative border-b-2 border-red-300 py-2 pl-3 pr-4 sm:pr-6">
						<span class="sr-only">Actions</span>
					</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-blue-100">
				{#each visibleStudents as student (student.id)}
					<tr class="group h-12 cursor-pointer transition-colors hover:bg-blue-50/30">
						<td
							class="whitespace-nowrap py-2 pl-4 pr-3 font-hand text-2xl text-ink transition-colors group-hover:text-indigo-700 sm:pl-6"
						>
							{student.lastName}
						</td>
						<td class="whitespace-nowrap px-3 py-2 font-hand text-2xl text-gray-700">
							{student.firstName}
						</td>
						<td class="whitespace-nowrap px-3 py-2 font-hand text-2xl text-gray-700">
							{student.grade}
						</td>
						<td
							class="relative whitespace-nowrap py-2 pl-3 pr-4 text-right font-hand text-lg font-medium sm:pr-6"
						>
							<button
								class="text-indigo-600 opacity-60 transition-opacity hover:text-indigo-900 hover:opacity-100"
							>
								Voir la fiche ➜
							</button>
						</td>
					</tr>
				{/each}

				{#each newStudents as newStudent, i (i)}
					<tr class="h-12 transition-all duration-300 ease-in-out">
						<td class="whitespace-nowrap py-1 pl-4 pr-3 align-bottom sm:pl-6">
							<input
								type="text"
								bind:value={newStudent.lastName}
								oninput={() => onInput(i)}
								placeholder="Nom..."
								class={errorMessage && i < newStudents.length - 1 && !newStudent.lastName
									? errorHandwritingInputClass
									: handwritingInputClass}
							/>
						</td>
						<td class="whitespace-nowrap px-3 py-1 align-bottom">
							<input
								type="text"
								bind:value={newStudent.firstName}
								oninput={() => onInput(i)}
								placeholder="Prénom..."
								class={errorMessage && i < newStudents.length - 1 && !newStudent.firstName
									? errorHandwritingInputClass
									: handwritingInputClass}
							/>
						</td>
						<td class="whitespace-nowrap px-3 py-1 align-bottom">
							<select
								bind:value={newStudent.grade}
								class="block w-full cursor-pointer border-none bg-transparent font-hand text-xl text-gray-600 focus:ring-0"
							>
								{#each grades as grade (grade)}
									<option value={grade}>{grade}</option>
								{/each}
							</select>
						</td>
						<td class="whitespace-nowrap py-1 pl-3 pr-4 text-right sm:pr-6">
							{#if i < newStudents.length - 1}
								{#if newStudent.lastName.trim() && newStudent.firstName.trim()}
									<span class="font-hand text-xl text-green-500">✓</span>
								{:else}
									<span class="font-hand text-xl text-red-500">✗</span>
								{/if}
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
