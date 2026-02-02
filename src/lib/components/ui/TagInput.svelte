<script lang="ts">
	interface Props {
		id?: string;
		label?: string;
		placeholder?: string;
		tags?: string[];
		suggestions?: string[];
	}

	let { id, label, placeholder = 'Ajouter...', tags = $bindable([]), suggestions = [] } = $props();

	let inputValue = $state('');
	let filteredSuggestions = $derived(
		inputValue
			? suggestions.filter(
					(s) => s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
				)
			: []
	);

	function addTag(tag: string) {
		const trimmed = tag.trim();
		if (trimmed && !tags.includes(trimmed)) {
			tags = [...tags, trimmed];
		}
		inputValue = '';
	}

	function removeTag(tagToRemove: string) {
		tags = tags.filter((t) => t !== tagToRemove);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addTag(inputValue);
		} else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
			removeTag(tags[tags.length - 1]);
		}
	}
</script>

<div class="flex flex-col space-y-2">
	{#if label}
		<label for={id} class="font-hand ml-1 block text-lg text-gray-600">{label}</label>
	{/if}

	<div
		class="flex min-h-[50px] flex-wrap items-center gap-2 rounded-xl border border-stone-300 bg-stone-50 p-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-200"
	>
		{#each tags as tag}
			<div
				class="flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-100 px-2 py-1 text-indigo-800 shadow-sm"
			>
				<span class="font-hand">{tag}</span>
				<button
					onclick={() => removeTag(tag)}
					class="ml-1 text-indigo-400 hover:text-indigo-600 focus:outline-none"
					aria-label="Remove {tag}"
				>
					×
				</button>
			</div>
		{/each}

		<div class="relative min-w-[120px] flex-grow">
			<input
				{id}
				type="text"
				bind:value={inputValue}
				onkeydown={handleKeydown}
				{placeholder}
				class="font-hand w-full border-none bg-transparent p-1 text-lg placeholder-stone-400 focus:ring-0"
			/>

			{#if filteredSuggestions.length > 0}
				<div
					class="absolute left-0 top-full z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-stone-200 bg-white shadow-lg"
				>
					{#each filteredSuggestions as suggestion}
						<button
							onclick={() => addTag(suggestion)}
							class="font-hand w-full px-3 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-indigo-50"
						>
							{suggestion}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
