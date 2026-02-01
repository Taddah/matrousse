<script lang="ts">
	interface Props {
		id?: string;
		value: string;
		label?: string;
		options: { value: string; label: string }[];
		onchange?: (event: Event) => void;
	}

	let { id, value = $bindable(), label, options, onchange }: Props = $props();
</script>

<div
	class="flex items-center space-x-2 rounded-full border border-stone-300 bg-stone-50 px-4 py-1 shadow-sm transition-colors hover:border-stone-400"
>
	{#if label}
		<label for={id} class="block font-hand text-lg text-gray-600">{label}</label>
	{/if}
	<select
		{id}
		bind:value
		{onchange}
		class="cursor-pointer border-none bg-transparent py-0 pl-2 pr-8 font-hand text-lg font-bold text-ink focus:ring-0"
	>
		{#each options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</div>
