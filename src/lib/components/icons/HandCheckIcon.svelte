<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<svg
	class={className}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="3"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	<path d="M20 6L9 17l-5-5" class="animate-draw" />
</svg>

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
