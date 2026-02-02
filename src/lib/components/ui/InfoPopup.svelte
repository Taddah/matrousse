<script lang="ts">
	import { scale } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	let isOpen = $state(false);
	let { title = 'Info', children }: { title?: string; children: Snippet } = $props();

	function toggle() {
		isOpen = !isOpen;
	}

	function close() {
		isOpen = false;
	}

	// click outside action with callback
	function clickOutside(node: HTMLElement, onOutClick: () => void) {
		const handleClick = (event: MouseEvent) => {
			if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
				onOutClick();
			}
		};

		document.addEventListener('click', handleClick, true);

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}
</script>

<div class="relative ml-2 inline-block" use:clickOutside={close}>
	<button
		onclick={toggle}
		class="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-colors hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
		aria-label="Plus d'informations"
	>
		<span class="text-sm font-bold">?</span>
	</button>

	{#if isOpen}
		<div
			transition:scale={{ duration: 200, start: 0.95 }}
			class="absolute left-0 top-8 z-50 w-72 origin-top-left rounded-xl border border-indigo-100 bg-white p-4 shadow-xl md:w-96"
		>
			{#if title}
				<h4 class="font-hand mb-2 text-lg font-bold text-indigo-900">{title}</h4>
			{/if}
			<div class="font-hand text-base leading-relaxed text-stone-600">
				{@render children()}
			</div>
			<div
				class="absolute -top-2 left-2 size-4 rotate-45 border-l border-t border-indigo-100 bg-white"
			></div>
		</div>
	{/if}
</div>
