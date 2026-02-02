<script lang="ts">
	import type { JournalEntry } from '$lib/types';

	interface Props {
		entry: JournalEntry;
		isLeft: boolean;
		onDelete: (id: string) => void;
		onChange: (id: string, newContent: string) => void;
	}

	let { entry, isLeft, onDelete, onChange }: Props = $props();

	let editing = $state(false);
	let localContent = $derived(entry.content);

	function formatDate(isoString: string) {
		return new Date(isoString).toLocaleString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function handleBlur() {
		editing = false;
		if (localContent !== entry.content) {
			onChange(entry.id, localContent);
		}
	}
</script>

<div class="relative flex w-full items-start {isLeft ? 'justify-start' : 'justify-end'}">
	<div
		class="absolute left-1/2 top-4 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-purple-500 shadow"
	></div>

	<div
		class="font-hand absolute top-4 text-sm text-gray-500 {isLeft
			? 'left-1/2 ml-6 text-left'
			: 'right-1/2 mr-6 text-right'}"
	>
		{formatDate(entry.date)}
	</div>

	<div class="group relative w-[45%]">
		{#if editing}
			<div class="rounded-lg border-2 border-purple-400 bg-white p-3 shadow-md">
				<!-- svelte-ignore a11y_autofocus -->
				<textarea
					bind:value={localContent}
					class="font-hand min-h-[80px] w-full resize-none border-none bg-transparent p-0 text-xl text-gray-800 focus:ring-0"
					autofocus
					onblur={handleBlur}
					aria-label="Modifier l'entrée"
				></textarea>
				<div class="mt-2 text-right text-xs text-gray-400">Cliquer dehors pour terminer</div>
			</div>
		{:else}
			<button
				type="button"
				class="relative w-full cursor-pointer rounded-lg border border-purple-200 bg-white/60 p-4 text-left shadow-sm transition-all hover:border-purple-400 hover:bg-white/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400"
				onclick={() => {
					editing = true;
					localContent = entry.content;
				}}
			>
				<p class="font-hand whitespace-pre-wrap text-xl text-gray-700">
					{entry.content}
				</p>
			</button>
			<button
				type="button"
				class="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-sm hover:bg-red-200 group-hover:flex"
				onclick={(e) => {
					e.stopPropagation();
					onDelete(entry.id);
				}}
				title="Supprimer"
				aria-label="Supprimer l'entrée du {formatDate(entry.date)}"
			>
				<span class="text-xs font-bold">✕</span>
			</button>
		{/if}
	</div>
</div>
