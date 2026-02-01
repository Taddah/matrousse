<script lang="ts">
	interface Props {
		variant?: 'yellow' | 'blue' | 'pink' | 'green';
		rotate?: number;
		pinned?: boolean;
		fullWidth?: boolean;
		minHeight?: string;
		children?: import('svelte').Snippet;
	}

	let {
		variant = 'yellow',
		rotate = 1,
		pinned = true,
		fullWidth = false,
		minHeight = 'auto',
		children
	}: Props = $props();

	const colors = {
		yellow: 'bg-yellow-100 border-yellow-200',
		blue: 'bg-blue-100 border-blue-200',
		pink: 'bg-pink-100 border-pink-200',
		green: 'bg-green-100 border-green-200'
	};

	let colorClass = $derived(colors[variant]);
</script>

<div
	class="sticker relative p-8 text-center shadow-lg transition-transform duration-300 {colorClass} {fullWidth
		? 'w-full'
		: 'max-w-xl'}"
	style="transform: rotate({rotate}deg); min-height: {minHeight};"
>
	{#if pinned}
		<div
			class="absolute -top-3 left-1/2 h-4 w-4 -translate-x-1/2 transform rounded-full border border-red-600 bg-red-500 shadow-sm"
		></div>
	{/if}

	{@render children?.()}
</div>
