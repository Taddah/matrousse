<script lang="ts">
	import StickerButton from '$lib/components/ui/StickerButton.svelte';
	import PaperModal from '$lib/components/ui/PaperModal.svelte';

	let { isOpen, onClose, onSave, initialDate } = $props<{
		isOpen: boolean;
		onClose: () => void;
		onSave: (slots: any[]) => void;
		initialDate?: Date | null;
	}>();

	let startDate = $state('');
	let endDate = $state('');
	let startTime = $state('16:00');
	let endTime = $state('18:00');
	let duration = $state(15);
	let bufferTime = $state(0);
	let loading = $state(false);

	function handleSubmit() {
		if (!startDate || !endDate || !startTime || !endTime) return;
		loading = true;

		const slots = [];
		// Parse as local midnight to avoid timezone issues
		let curr = new Date(startDate + 'T00:00:00');
		const last = new Date(endDate + 'T00:00:00');

		// Loop days
		while (curr <= last) {
			// Parse start/end times for this day
			const [startH, startM] = startTime.split(':').map(Number);
			const [endH, endM] = endTime.split(':').map(Number);

			let timeCursor = new Date(curr);
			timeCursor.setHours(startH, startM, 0, 0);

			const timeEnd = new Date(curr);
			timeEnd.setHours(endH, endM, 0, 0);

			// Loop time on this day
			// Use do/while or simple while?
			// If duration > time window, no slot.
			while (timeCursor < timeEnd) {
				const slotStart = new Date(timeCursor);
				const slotEnd = new Date(timeCursor.getTime() + duration * 60000); // add minutes

				// Strict check: slot must end at or before timeEnd
				if (slotEnd > timeEnd) break;

				slots.push({
					start_time: slotStart.toISOString(),
					end_time: slotEnd.toISOString(),
					is_booked: false
				});

				// Advance cursor: end of slot + buffer
				timeCursor = new Date(slotEnd.getTime() + bufferTime * 60000);
			}

			// Next day
			curr.setDate(curr.getDate() + 1);
		}

		onSave(slots);
		loading = false;
	}

	function resetAndClose() {
		loading = false;
		onClose();
	}
</script>

<PaperModal
	{isOpen}
	onClose={resetAndClose}
	title={initialDate ? 'Ajouter un créneau' : 'Ajouter des créneaux'}
	variant="green"
>
	<div class="space-y-4">
		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="start-date" class="block text-sm font-bold text-gray-700">Du</label>
				<input
					id="start-date"
					type="date"
					bind:value={startDate}
					class="w-full rounded border p-2"
				/>
			</div>
			<div>
				<label for="end-date" class="block text-sm font-bold text-gray-700">Au</label>
				<input id="end-date" type="date" bind:value={endDate} class="w-full rounded border p-2" />
			</div>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="start-time" class="block text-sm font-bold text-gray-700">Heure début</label>
				<input
					id="start-time"
					type="time"
					bind:value={startTime}
					class="w-full rounded border p-2"
				/>
			</div>
			{#if !initialDate}
				<div>
					<label for="end-time" class="block text-sm font-bold text-gray-700">Heure fin</label>
					<input id="end-time" type="time" bind:value={endTime} class="w-full rounded border p-2" />
				</div>
			{:else}
				<div class="flex items-end pb-2 text-sm text-gray-500">
					➔ Fin : {endTime}
				</div>
			{/if}
		</div>

		<div>
			<span class="block text-sm font-bold text-gray-700">Durée du créneau</span>
			<div class="mt-1 flex gap-2">
				{#each [15, 30, 45, 60] as d}
					<button
						class="rounded border px-3 py-1 {duration === d
							? 'bg-indigo-600 text-white'
							: 'bg-white text-gray-700'}"
						onclick={() => (duration = d)}
					>
						{d} min
					</button>
				{/each}
			</div>
		</div>

		<div>
			<span class="block text-sm font-bold text-gray-700">Temps de battement (buffer)</span>
			<div class="mt-1 flex gap-2">
				{#each [0, 5, 10, 15] as b}
					<button
						class="rounded border px-3 py-1 {bufferTime === b
							? 'bg-indigo-600 text-white'
							: 'bg-white text-gray-700'}"
						onclick={() => (bufferTime = b)}
					>
						{b === 0 ? 'Aucun' : `${b} min`}
					</button>
				{/each}
			</div>
		</div>

		<div class="flex justify-end gap-2 pt-4">
			<StickerButton variant="gray" onclick={resetAndClose}>Annuler</StickerButton>
			<StickerButton variant="green" onclick={handleSubmit} disabled={loading}>
				{loading ? 'Création...' : 'Valider'}
			</StickerButton>
		</div>
	</div>
</PaperModal>
