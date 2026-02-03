<script lang="ts">
	import Doodle from '$lib/components/ui/Doodle.svelte';
	import type { TransitionConfig } from 'svelte/transition';

	interface Props {
		title: string;
		variant?: 'yellow' | 'blue' | 'pink' | 'green' | 'purple';
		onClose: () => void;
		children?: import('svelte').Snippet;
		actions?: import('svelte').Snippet;
		id?: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		send?: (node: Element, params: any) => TransitionConfig | (() => TransitionConfig);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		receive?: (node: Element, params: any) => TransitionConfig | (() => TransitionConfig);
	}

	let {
		title,
		variant = 'yellow',
		onClose,
		children,
		actions,
		id,
		send,
		receive
	}: Props = $props();

	const colors = {
		yellow: 'bg-yellow-100 border-yellow-200',
		blue: 'bg-blue-100 border-blue-200',
		pink: 'bg-pink-100 border-pink-200',
		green: 'bg-green-100 border-green-200',
		purple: 'bg-purple-100 border-purple-200'
	};

	let colorClass = $derived(colors[variant]);

	function getTransition(node: Element) {
		if (send && receive && id) {
			return send(node, { key: id });
		}
		return {};
	}

	function getInTransition(node: Element) {
		if (send && receive && id) {
			return receive(node, { key: id });
		}
		return {};
	}
</script>

<div
	class="relative flex h-auto min-h-full w-full flex-col overflow-visible {colorClass} sm:h-full sm:overflow-hidden"
	in:getInTransition
	out:getTransition
>
	<div
		class="relative z-10 flex flex-none flex-col gap-4 border-b border-dashed border-gray-400/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"
	>
		<h2 class="font-hand text-ink text-3xl font-bold sm:text-4xl">
			{title}
		</h2>

		<div class="flex w-full items-center justify-between gap-4 sm:w-auto">
			{@render actions?.()}
			<button
				onclick={onClose}
				class="font-hand group flex items-center gap-2 rounded-full border-2 border-dashed border-gray-400 px-4 py-2 text-xl text-gray-500 transition-all hover:border-gray-600 hover:bg-white/50 hover:text-gray-800"
			>
				<span>↩</span>
				<span class="hidden text-lg sm:inline">Retour au bureau</span>
			</button>
		</div>
	</div>

	<div class="relative z-10 flex-1 p-4 sm:overflow-y-auto sm:p-8">
		{@render children?.()}
	</div>

	<Doodle
		type="circle"
		class="pointer-events-none absolute bottom-4 right-4 z-0 h-32 w-32 rotate-12 opacity-10"
	/>
	<div
		class="absolute left-0 top-0 h-full w-2 bg-gradient-to-r from-black/5 to-transparent sm:block"
	></div>
</div>
