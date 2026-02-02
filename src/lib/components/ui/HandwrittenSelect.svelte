<script lang="ts">
	interface Props {
		id?: string;
		value: string;
		label?: string;
		options: (
			| { value: string; label: string }
			| { label: string; options: { value: string; label: string }[] }
		)[];
		onchange?: (event: Event) => void;
	}

	let { id, value = $bindable(), label, options, onchange }: Props = $props();
</script>

<div
	class="flex items-center space-x-2 rounded-full border border-stone-300 bg-stone-50 px-4 py-1 shadow-sm transition-colors hover:border-stone-400"
>
	{#if label}
		<label for={id} class="font-hand block text-lg text-gray-600">{label}</label>
	{/if}
	<select
		{id}
		bind:value
		{onchange}
		class="font-hand text-ink w-full cursor-pointer truncate border-none bg-transparent py-0 pl-2 pr-8 text-lg font-bold focus:ring-0"
	>
		{#each options as option}
			{#if 'options' in option}
				<optgroup label={option.label}>
					{#each option.options as subOption (subOption.value)}
						<option value={subOption.value}>{subOption.label}</option>
					{/each}
				</optgroup>
			{:else}
				<option value={option.value}>{option.label}</option>
			{/if}
		{/each}
	</select>
</div>
