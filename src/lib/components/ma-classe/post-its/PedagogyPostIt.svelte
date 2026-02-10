<script lang="ts">
	import PostIt from '$lib/components/ui/PostIt.svelte';
	import PostItView from '$lib/components/ma-classe/PostItView.svelte';
	import Doodle from '$lib/components/ui/Doodle.svelte';
	import type { TransitionConfig } from 'svelte/transition';
	import type { Student, GradeItem, GradingSystem } from '$lib/types';
	import { COMPETENCIES } from '$lib/constants';
	import CompetencyDrawer from '$lib/components/ma-classe/pedagogy/CompetencyDrawer.svelte';
	import GradeList from '$lib/components/ma-classe/pedagogy/GradeList.svelte';
	import { assessCompetency } from '$lib/services/assessmentService';

	interface Props {
		isActive: boolean;
		onOpen: () => void;
		onClose: () => void;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		send: (node: Element, params: any) => TransitionConfig | (() => TransitionConfig);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		receive: (node: Element, params: any) => TransitionConfig | (() => TransitionConfig);
		student?: Student;
		onSave?: () => Promise<void>;
		isReadOnly?: boolean;
		gradingSystem?: 'percentage' | 'color' | 'letter';
	}

	let {
		isActive,
		onOpen,
		onClose,
		send,
		receive,
		student = $bindable(),
		onSave,
		isReadOnly = false,
		gradingSystem = 'percentage'
	}: Props = $props();

	let openDrawerId = $state<string | null>(null);

	function toggleDrawer(id: string) {
		if (openDrawerId === id) {
			openDrawerId = null;
		} else {
			openDrawerId = id;
		}
	}

	async function addGrade(
		subCompetencyId: string,
		gradeInput: { value: number; base: number; weight: number; type?: GradingSystem }
	) {
		if (!student || isReadOnly) return;

		if (!student.grades) {
			student.grades = {};
		}

		if (!student.grades[subCompetencyId]) {
			student.grades[subCompetencyId] = [];
		}

		const newGrade: GradeItem = {
			id: crypto.randomUUID(),
			value: gradeInput.value,
			base: gradeInput.base,
			weight: gradeInput.weight,
			date: new Date().toISOString(),
			type: gradeInput.type || 'percentage'
		};

		student.grades[subCompetencyId] = [...student.grades[subCompetencyId], newGrade];

		if (onSave) {
			await onSave();
		}
	}

	async function deleteGrade(subCompetencyId: string, gradeId: string) {
		if (!student || !student.grades || isReadOnly) return;

		const currentGrades = student.grades[subCompetencyId] || [];
		student.grades[subCompetencyId] = currentGrades.filter((g) => g.id !== gradeId);

		if (onSave) {
			await onSave();
		}
	}
</script>

{#if isActive}
	<div
		class="fixed inset-0 z-50 h-full w-full overflow-y-auto sm:absolute sm:inset-0 sm:z-20 sm:overflow-visible"
	>
		<PostItView title="Suivi Pédagogique" variant="yellow" {onClose} id="pedagogy" {send} {receive}>
			<div class="space-y-4 pb-4">
				{#each COMPETENCIES as competency (competency.id)}
					<div class="rounded-xl border border-yellow-200 bg-yellow-50/50 p-3">
						<div class="mb-2 flex items-center gap-2 px-1">
							<span class="text-xl">{competency.icon}</span>
							<h3 class="font-hand text-xl font-bold text-gray-800">{competency.name}</h3>
						</div>

						<div class="space-y-1">
							{#each competency.subCompetencies as subComp (subComp.id)}
								{@const grades = student?.grades?.[subComp.id] || []}
								{@const assessment = assessCompetency(grades)}
								<CompetencyDrawer
									title={subComp.name}
									gradeCount={grades.length}
									{assessment}
									isOpen={openDrawerId === subComp.id}
									onToggle={() => toggleDrawer(subComp.id)}
									color={competency.color}
								>
									<GradeList
										{grades}
										onAdd={(val) => addGrade(subComp.id, val)}
										onDelete={(id) => deleteGrade(subComp.id, id)}
										defaultGradingSystem={gradingSystem}
									/>
								</CompetencyDrawer>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</PostItView>
	</div>
{:else}
	<div class="relative z-10 w-full sm:absolute sm:bottom-20 sm:left-32 sm:w-80">
		<PostIt
			variant="yellow"
			rotate={0}
			class="h-60 cursor-pointer shadow-md transition-all hover:scale-105 hover:shadow-xl sm:rotate-2 sm:hover:rotate-0"
			onclick={onOpen}
			id="pedagogy"
			{send}
			{receive}
		>
			<div class="flex h-full flex-col items-center justify-center text-center">
				<Doodle type="flower" class="mb-4 h-14 w-14 text-yellow-600" />
				<h3 class="font-hand text-3xl font-bold text-yellow-900">Pédagogie</h3>
				{#if student?.grades}
					{@const totalGrades = Object.values(student.grades).flat().length}
					{#if totalGrades > 0}
						<span
							class="mt-2 rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-800"
						>
							{totalGrades} note{totalGrades > 1 ? 's' : ''}
						</span>
					{:else}
						<p class="font-hand mt-2 text-lg text-yellow-800">Suivi & Notes</p>
					{/if}
				{:else}
					<p class="font-hand mt-2 text-lg text-yellow-800">Suivi & Notes</p>
				{/if}
			</div>
		</PostIt>
	</div>
{/if}
