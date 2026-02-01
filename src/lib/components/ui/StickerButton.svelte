<script lang="ts">
	interface Props {
		variant?: 'green' | 'red' | 'indigo';
		onclick?: () => void;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		children?: import('svelte').Snippet;
	}

	let {
		variant = 'green',
		onclick,
		disabled = false,
		type = 'button',
		class: className = '',
		children
	}: Props = $props();

	const colors = {
		green: 'bg-green-500 hover:bg-green-600 border-green-600',
		red: 'bg-red-400 hover:bg-red-500 border-red-500',
		indigo: 'bg-indigo-600 hover:bg-indigo-700 border-indigo-700'
	};

	let colorClass = $derived(colors[variant]);
</script>

<button
	{type}
	{onclick}
	{disabled}
	class="sticker inline-flex items-center justify-center rounded-sm border-b-4 px-6 py-2 pb-1 font-hand text-xl font-bold text-white shadow-md transition-all focus:outline-none disabled:cursor-not-allowed disabled:transform-none disabled:opacity-50 {colorClass} {className}"
>
	{@render children?.()}
</button>
