<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import Doodle from './Doodle.svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		title: string;
		variant?: 'yellow' | 'blue' | 'pink' | 'green';
		children?: import('svelte').Snippet;
	}

	let { isOpen, onClose, title, variant = 'yellow', children }: Props = $props();

	const bgColors = {
		yellow: 'bg-yellow-100',
		blue: 'bg-blue-100',
		pink: 'bg-pink-100',
		green: 'bg-green-100'
	};

	let bgClass = $derived(bgColors[variant]);
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		onclick={onClose}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && onClose()}
	>
		<div
			class="sticker relative w-full max-w-2xl transform overflow-hidden {bgClass} p-8 shadow-2xl transition-all"
			transition:scale={{ duration: 300, start: 0.95 }}
			onclick={(e) => e.stopPropagation()}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Escape' && onClose()}
		>
			<button
				onclick={onClose}
				class="absolute right-4 top-4 z-20 text-gray-400 transition-colors hover:text-red-500"
			>
				<Doodle type="arrow" class="h-8 w-8 rotate-45" />
			</button>

			<div
				class="absolute -top-3 left-1/2 h-8 w-32 -translate-x-1/2 rotate-1 bg-white/30 shadow-sm"
			></div>
			<div class="relative z-10 mb-6 pb-2">
				<h2 class="font-hand text-ink text-4xl font-bold">{title}</h2>
			</div>

			<div class="font-hand text-xl leading-relaxed text-gray-800">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
