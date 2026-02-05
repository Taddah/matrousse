<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { Snippet } from 'svelte';
	import type { AssessmentResult } from '$lib/services/assessmentService';

	interface Props {
		title: string;
		gradeCount: number;
		assessment?: AssessmentResult | null;
		isOpen: boolean;
		onToggle: () => void;
		color?: 'blue' | 'green' | 'purple' | string;
		children?: Snippet;
	}

	let {
		title,
		gradeCount,
		assessment,
		isOpen,
		onToggle,
		color = 'blue',
		children
	}: Props = $props();

	const colorClasses: Record<string, string> = {
		blue: 'text-blue-700 bg-blue-50 border-blue-100 hover:bg-blue-100',
		green: 'text-green-700 bg-green-50 border-green-100 hover:bg-green-100',
		purple: 'text-purple-700 bg-purple-50 border-purple-100 hover:bg-purple-100'
	};
</script>

<div class="mb-2 overflow-hidden rounded-lg border border-transparent">
	<button
		class="flex w-full items-center justify-between px-3 py-2 transition-colors {colorClasses[
			color
		] || 'bg-gray-50'}"
		onclick={onToggle}
	>
		<div class="flex items-center gap-2">
			{#if isOpen}
				<!-- ChevronDown -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			{:else}
				<!-- ChevronRight -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="m9 18 6-6-6-6" />
				</svg>
			{/if}
			<span class="font-medium">{title}</span>
		</div>
		<div class="flex items-center gap-2">
			{#if assessment}
				<span class="rounded-md px-2 py-0.5 text-xs font-bold shadow-sm {assessment.color}">
					{assessment.label}
				</span>
			{/if}
			{#if gradeCount > 0}
				<span class="rounded-full bg-white/60 px-2 py-0.5 text-xs font-bold shadow-sm">
					{gradeCount}
				</span>
			{/if}
		</div>
	</button>

	{#if isOpen}
		<div class="border-t border-gray-100 bg-white p-3" transition:slide>
			{@render children?.()}
		</div>
	{/if}
</div>
