<script lang="ts">
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
		<div
			class="absolute -top-6 left-1/2 z-20 h-10 w-10 -translate-x-1/2 drop-shadow-sm filter"
			style="transform: translateX(-50%) rotate({pinRotation || Math.random() * 30 - 15}deg);"
		>
			<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
				<ellipse cx="20" cy="36" rx="3" ry="1.5" fill="#000" fill-opacity="0.2" />
				<path d="M20 36L20 25" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" />
				<circle cx="20" cy="22" r="8" fill="#EF4444" />
				<circle cx="17" cy="19" r="2.5" fill="white" fill-opacity="0.4" />
				<path
					d="M20 30C24.4183 30 28 26.4183 28 22C28 20.5 27.6 19.1 26.9 17.9C27.6 19.1 28 20.5 28 22C28 26.4183 24.4183 30 20 30Z"
					fill="#991B1B"
					fill-opacity="0.2"
				/>
			</svg>
		</div>
	{/if}

	{@render children?.()}
</div>
