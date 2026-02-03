<script lang="ts">
	interface Props {
		rotation?: number;
	}

	let { rotation = 0 }: Props = $props();
</script>

<div
	class="absolute -top-6 left-1/2 z-20 h-10 w-10 -translate-x-1/2 drop-shadow-sm filter"
	style="transform: translateX(-50%) rotate({rotation}deg);"
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
