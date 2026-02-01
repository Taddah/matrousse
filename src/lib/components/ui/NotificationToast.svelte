<script lang="ts">
	import { notifications } from '$lib/stores/notifications';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';

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

<div class="fixed top-4 right-4 z-50 flex flex-col space-y-4 pointer-events-none">
	{#each $notifications as note (note.id)}
		<div
			animate:flip={{ duration: 300 }}
			transition:fly={{ x: 200, duration: 300 }}
			class="pointer-events-auto transform transition-all duration-200 hover:scale-105"
		>
			<div
				class="relative max-w-sm w-full shadow-lg rounded-sm border-l-4 p-4 font-hand text-lg {styles[
					note.type
				]}"
			>
				<div class="absolute -top-3 -left-2 text-2xl transform -rotate-12 filter drop-shadow-sm">
					<span class="opacity-90">{icons[note.type]}</span>
				</div>

				<button
					onclick={() => notifications.remove(note.id)}
					class="absolute top-1 right-1 text-gray-400 hover:text-gray-600 focus:outline-none"
				>
					<span class="sr-only">Fermer</span>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				<div class="ml-4 pr-4">
					<p>{note.message}</p>
				</div>

				<!-- Tape effect -->
				<div
					class="absolute -top-3 left-1/2 transform -translate-x-1/2 w-12 h-4 bg-white opacity-40 rotate-1"
				></div>
			</div>
		</div>
	{/each}
</div>
