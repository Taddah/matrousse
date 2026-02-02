<script lang="ts">
	interface Props {
		checked: boolean;
		onchange: (checked: boolean) => void;
		disabled?: boolean;
		label?: string;
		id?: string;
	}

	let { checked = $bindable(), onchange, disabled = false, label, id }: Props = $props();

	function handleClick(e: MouseEvent) {
		e.stopPropagation();
		if (!disabled) {
			checked = !checked;
			onchange(checked);
		}
	}
</script>

<button
	type="button"
	class="group flex items-center gap-2 outline-none"
	onclick={handleClick}
	{disabled}
	{id}
	aria-checked={checked}
	role="checkbox"
>
	<div class="relative h-6 w-6">
		<!-- Box -->
		<div
			class="absolute inset-0 rounded border-2 border-gray-400 transition-colors group-hover:border-purple-500 {checked
				? 'border-purple-500 bg-purple-50'
				: 'bg-white'}"
		></div>

		<!-- Checkmark (Hand-drawn style) -->
		{#if checked}
			<svg
				class="absolute inset-0 h-full w-full text-purple-600"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M20 6L9 17l-5-5" class="animate-draw" />
			</svg>
		{/if}
	</div>
	{#if label}
		<span class="font-hand text-lg text-gray-700 {disabled ? 'opacity-50' : ''}">{label}</span>
	{/if}
</button>

<style>
	.animate-draw {
		stroke-dasharray: 24;
		stroke-dashoffset: 24;
		animation: draw 0.3s ease-out forwards;
	}

	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}
</style>
