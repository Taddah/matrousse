<script lang="ts">
	import type { GradeItem, GradeType } from '$lib/types';
	import AddGradeForm from './AddGradeForm.svelte';
	import { slide, scale } from 'svelte/transition';
	import { assessCompetency } from '$lib/services/assessmentService';

	interface Props {
		grades: GradeItem[];
		onAdd: (grade: { value: number; base: number; weight: number; type: GradeType }) => void;
		onDelete: (id: string) => void;
		defaultGradeType?: GradeType;
	}

	let { grades, onAdd, onDelete, defaultGradeType = 'percentage' }: Props = $props();

	let isAdding = $state(false);

	let assessment = $derived(assessCompetency(grades));

	function getLetter(val: number, base: number): string {
		const percentage = (val / base) * 100;
		if (percentage >= 100) return 'D';
		if (percentage >= 75) return 'A';
		if (percentage >= 50) return 'PA';
		return 'NA';
	}

	function getColorClass(val: number, base: number): string {
		const percentage = (val / base) * 100;
		if (percentage >= 100) return 'bg-green-600';
		if (percentage >= 75) return 'bg-green-400';
		if (percentage >= 50) return 'bg-orange-400';
		return 'bg-red-500';
	}
</script>

<div class="mt-2 text-sm text-gray-600">
	{#if grades.length > 0}
		<div
			class="flex items-center justify-between px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500"
		>
			<span>Notes</span>
			{#if assessment}
				<span class="rounded px-2 py-0.5 {assessment.color}"
					>Statut: <span class="font-bold">{assessment.label}</span></span
				>
			{/if}
		</div>

		<ul class="flex flex-wrap gap-2">
			{#each grades as grade (grade.id)}
				<li
					class="group relative flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 shadow-sm transition-all hover:border-red-200 hover:pr-6"
					transition:scale
				>
					{#if grade.type === 'color'}
						<div
							class="h-4 w-4 rounded-full {getColorClass(grade.value, grade.base)} shadow-sm"
						></div>
					{:else if grade.type === 'letter'}
						<div
							class="flex h-5 min-w-[20px] items-center justify-center rounded bg-gray-100 text-[10px] font-bold text-gray-700"
						>
							{getLetter(grade.value, grade.base)}
						</div>
					{:else}
						<!-- Default Percentage -->
						<div class="flex items-baseline">
							<span class="font-bold text-gray-800">{grade.value}</span>
							<span class="text-[9px] text-gray-500">%</span>
						</div>
					{/if}

					{#if grade.weight !== 1}
						<span
							class="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-yellow-100 px-1 text-[9px] font-bold text-yellow-800 shadow-sm"
						>
							x{grade.weight}
						</span>
					{/if}

					<button
						class="absolute right-1 hidden text-gray-400 hover:text-red-500 group-hover:block"
						onclick={() => onDelete(grade.id)}
						aria-label="Supprimer la note"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-x"
						>
							<path d="M18 6 6 18" />
							<path d="m6 6 18 18" />
						</svg>
					</button>
				</li>
			{/each}
			<li>
				<button
					class="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
					onclick={() => (isAdding = true)}
					title="Ajouter une note"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-plus"
					>
						<path d="M5 12h14" />
						<path d="M12 5v14" />
					</svg>
				</button>
			</li>
		</ul>
	{:else if !isAdding}
		<div class="flex items-center justify-center py-2">
			<button
				class="flex items-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
				onclick={() => (isAdding = true)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-plus"
				>
					<path d="M5 12h14" />
					<path d="M12 5v14" />
				</svg>
				Ajouter une première note
			</button>
		</div>
	{/if}

	{#if isAdding}
		<AddGradeForm
			onAdd={(newGrade) => {
				onAdd(newGrade);
				isAdding = false;
			}}
			onCancel={() => (isAdding = false)}
			{defaultGradeType}
		/>
	{/if}
</div>
