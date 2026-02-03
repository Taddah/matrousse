<script lang="ts">
	import { notifications } from '$lib/stores/notifications';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import CloseIcon from '$lib/components/icons/CloseIcon.svelte';

	const styles = {
		success: 'bg-green-100 border-green-400 text-green-800 rotate-2',
		error: 'bg-red-100 border-red-400 text-red-800 -rotate-2',
		info: 'bg-blue-100 border-blue-400 text-blue-800 rotate-1'
	};

	const icons = {
		success: '✅',
		error: '❌',
		info: '📌'
	};
</script>

<div class="pointer-events-none fixed right-4 top-4 z-50 flex flex-col space-y-4">
	{#each $notifications as note (note.id)}
		<div
			animate:flip={{ duration: 300 }}
			transition:fly={{ x: 200, duration: 300 }}
			class="pointer-events-auto transform transition-all duration-200 hover:scale-105"
		>
			<div
				class="font-hand relative w-full max-w-sm rounded-sm border-l-4 p-4 text-lg shadow-lg {styles[
					note.type
				]}"
			>
				<div class="absolute -left-2 -top-3 -rotate-12 transform text-2xl drop-shadow-sm filter">
					<span class="opacity-90">{icons[note.type]}</span>
				</div>

				<button
					onclick={() => notifications.remove(note.id)}
					class="absolute right-1 top-1 text-gray-400 hover:text-gray-600 focus:outline-none"
				>
					<span class="sr-only">Fermer</span>
					<CloseIcon />
				</button>

				<div class="ml-4 pr-4">
					<p>{note.message}</p>
				</div>

				<!-- Tape effect -->
				<div
					class="absolute -top-3 left-1/2 h-4 w-12 -translate-x-1/2 rotate-1 transform bg-white opacity-40"
				></div>
			</div>
		</div>
	{/each}
</div>
