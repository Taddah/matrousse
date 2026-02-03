<script lang="ts">
	interface Props {
		variant?: 'green' | 'red' | 'indigo' | 'yellow';
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
		indigo: 'bg-indigo-600 hover:bg-indigo-700 border-indigo-700',
		yellow: 'bg-yellow-400 hover:bg-yellow-500 border-yellow-600 text-yellow-900'
	};

	let colorClass = $derived(colors[variant]);
</script>

<button
	{type}
	{onclick}
	{disabled}
	class="sticker font-hand inline-flex items-center justify-center rounded-sm border-b-4 px-6 py-2 pb-1 text-xl font-bold text-white shadow-md transition-all focus:outline-none disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 {colorClass} {className}"
>
	{@render children?.()}
</button>
