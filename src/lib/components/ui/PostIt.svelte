<script lang="ts">
	import PinIcon from '$lib/components/icons/PinIcon.svelte';
	import type { TransitionConfig } from 'svelte/transition';

	interface Props {
		variant?: 'yellow' | 'blue' | 'pink' | 'green' | 'purple';
		rotate?: number;
		pinned?: boolean;
		fullWidth?: boolean;
		minHeight?: string;
		class?: string;
		pinRotation?: number;
		compact?: boolean;
		onclick?: () => void;
		children?: import('svelte').Snippet;
		id?: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		send?: (node: Element, params: any) => TransitionConfig | (() => TransitionConfig);
		receive?: (
			node: Element,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			params: any
		) => TransitionConfig | (() => TransitionConfig);
	}

	let {
		variant = 'yellow',
		rotate = 1,
		pinned = true,
		fullWidth = false,
		minHeight = 'auto',
		class: className = '',
		pinRotation,
		compact = false,
		onclick,
		children,
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

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="sticker relative text-center shadow-lg transition-transform duration-300 {compact
		? 'p-4'
		: 'p-8'} {colorClass} {fullWidth ? 'w-full' : 'max-w-xl'} {className} {onclick
		? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
		: ''}"
	style="transform: rotate({rotate}deg); min-height: {minHeight};"
	{onclick}
	role={onclick ? 'button' : undefined}
	tabindex={onclick ? 0 : undefined}
	onkeydown={onclick ? (e) => (e.key === 'Enter' || e.key === ' ') && onclick() : undefined}
	out:getTransition
	in:getInTransition
>
	{#if pinned}
		<PinIcon rotation={pinRotation || Math.random() * 30 - 15} />
	{/if}

	{@render children?.()}
</div>
