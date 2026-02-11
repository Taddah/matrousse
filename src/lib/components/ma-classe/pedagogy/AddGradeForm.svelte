<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { GradingSystem } from '$lib/types';

	interface Props {
		onAdd: (grade: { value: number; base: number; weight: number; type: GradingSystem }) => void;
		onCancel: () => void;
		defaultGradingSystem?: GradingSystem;
	}

	let { onAdd, onCancel, defaultGradingSystem = 'percentage' }: Props = $props();

	let gradeType = $derived<GradingSystem>(defaultGradingSystem);
	let value = $derived(defaultGradingSystem === 'percentage' ? 0 : 75);
	let base = $state(100);
	let weight = $state(1);

	$effect(() => {
		if (gradeType === 'percentage') {
			value = 0;
		} else {
			value = 75;
		}
	});

	const colorGrades = [
		{ val: 100, color: 'bg-green-600', label: 'Très bien' }, // D
		{ val: 75, color: 'bg-green-400', label: 'Bien' }, // A
		{ val: 50, color: 'bg-orange-400', label: 'Moyen' }, // PA
		{ val: 25, color: 'bg-red-500', label: 'Insuffisant' } // NA
	];

	const letterGrades = [
		{ val: 100, char: 'D', label: 'Dépassé' },
		{ val: 75, char: 'A', label: 'Acquis' },
		{ val: 50, char: 'PA', label: 'Partiellement Acquis' },
		{ val: 25, char: 'NA', label: 'Non Atteint' }
	];

	const weights = [
		{ label: 'Faible', value: 0.5 },
		{ label: 'Normal', value: 1 },
		{ label: 'Fort', value: 2 }
	];

	function handleSubmit(e: Event) {
		e.preventDefault();
		onAdd({ value, base, weight, type: gradeType });
	}

	function selectPreset(val: number) {
		value = val;
		base = 100;
	}
</script>

<form
	class="mt-4 overflow-hidden rounded-lg bg-white/50 p-4 shadow-sm"
	transition:slide
	onsubmit={handleSubmit}
>
	<!-- Type Selector -->
	<!-- Type Selector Hidden based on user preference -->

	<div class="space-y-4">
		<!-- Grade Input Area -->
		<div class="flex min-h-[60px] items-center justify-center">
			{#if gradeType === 'percentage'}
				<div class="flex items-end gap-1" transition:slide>
					<div class="flex flex-col items-center">
						<input
							type="number"
							min="0"
							max="100"
							bind:value
							class="w-20 rounded border-gray-200 bg-white px-2 py-1 text-center text-xl font-bold text-gray-800 focus:border-blue-400 focus:ring-blue-400"
						/>
					</div>
					<span class="mb-2 text-xl font-bold text-gray-500">%</span>
				</div>
			{:else if gradeType === 'color'}
				<div class="flex gap-2" transition:slide>
					{#each colorGrades as item}
						<button
							type="button"
							class="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 {item.color} {value ===
							item.val
								? 'border-gray-600 shadow-md ring-2 ring-white'
								: 'border-transparent opacity-80'}"
							onclick={() => selectPreset(item.val)}
							title={item.label}
						></button>
					{/each}
				</div>
			{:else if gradeType === 'letter'}
				<div class="flex gap-2" transition:slide>
					{#each letterGrades as item}
						<button
							type="button"
							class="flex h-8 min-w-[32px] items-center justify-center rounded-md border px-2 text-sm font-bold transition-colors {value ===
							item.val
								? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
								: 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}"
							onclick={() => selectPreset(item.val)}
							title={item.label}
						>
							{item.char}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Weight Selection (Buttons) -->
		<div class="px-2">
			<div class="mb-2 text-xs text-gray-500">
				<span>Coefficient</span>
			</div>
			<div class="grid grid-cols-3 gap-2">
				{#each weights as w}
					<button
						type="button"
						class="rounded-md border px-2 py-1.5 text-xs font-medium transition-all {weight ===
						w.value
							? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
							: 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}"
						onclick={() => (weight = w.value)}
					>
						{w.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Actions -->
		<div class="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-3">
			<button
				type="button"
				class="rounded-md px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
				onclick={onCancel}
			>
				Annuler
			</button>
			<button
				type="submit"
				class="rounded-md bg-blue-500 px-3 py-1 text-sm font-medium text-white hover:bg-blue-600"
			>
				Ajouter
			</button>
		</div>
	</div>
</form>
