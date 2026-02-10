<script lang="ts">
	import type { AgendaSlot } from '$lib/types';

	let { slots, onSlotClick, onEmptySlotClick } = $props<{
		slots: AgendaSlot[];
		onSlotClick?: (slot: AgendaSlot) => void;
		onEmptySlotClick?: (date: Date) => void;
	}>();

	let currentDate = $state(new Date());

	function getStartOfWeek(date: Date) {
		const d = new Date(date);
		const day = d.getDay();
		const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
		d.setHours(0, 0, 0, 0);
		return new Date(d.setDate(diff));
	}

	let startOfWeek = $derived(getStartOfWeek(currentDate));
	let weekDays = $derived(
		Array.from({ length: 7 }, (_, i) => {
			const d = new Date(startOfWeek);
			d.setDate(d.getDate() + i);
			return d;
		})
	);

	// Computed slots for this week
	let weekSlots = $derived(
		slots.filter((slot: { start_time: string | number | Date }) => {
			const d = new Date(slot.start_time);
			return d >= startOfWeek && d < new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
		})
	);

	const START_HOUR = 8;
	const END_HOUR = 20; // Inclusive of limit
	const HOUR_HEIGHT = 120; // px

	// Helper to position slots
	function getSlotStyle(slot: AgendaSlot) {
		const start = new Date(slot.start_time);
		const end = new Date(slot.end_time);

		// Calculate minutes from start of day
		const startMinutes = start.getHours() * 60 + start.getMinutes();
		const endMinutes = end.getHours() * 60 + end.getMinutes();

		// Base hour starts at START_HOUR
		const dayStartMinutes = START_HOUR * 60;

		// Scale: HOUR_HEIGHT px per 60 minutes => pxPerMinute = HOUR_HEIGHT / 60
		const pxPerMinute = HOUR_HEIGHT / 60;

		const top = Math.max(0, (startMinutes - dayStartMinutes) * pxPerMinute);
		let duration = (endMinutes - startMinutes) * pxPerMinute;

		// Ensure minimal visibility but respect duration visually
		duration = Math.max(30, duration);

		return `top: ${top}px; height: ${duration}px;`;
	}

	// Helper to get day index (0=Mon, 6=Sun)
	function getDayIndex(dateStr: string) {
		const d = new Date(dateStr);
		let day = d.getDay(); // 0=Sun, 1=Mon
		return day === 0 ? 6 : day - 1;
	}

	// Group slots by day index
	let slotsByDay = $derived.by(() => {
		const grouped: Record<number, AgendaSlot[]> = {};
		weekSlots.forEach((slot: AgendaSlot) => {
			const idx = getDayIndex(slot.start_time);
			if (!grouped[idx]) grouped[idx] = [];
			grouped[idx].push(slot);
		});
		return grouped;
	});

	const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

	function nextWeek() {
		const d = new Date(currentDate);
		d.setDate(d.getDate() + 7);
		currentDate = d;
	}

	function prevWeek() {
		const d = new Date(currentDate);
		d.setDate(d.getDate() - 7);
		currentDate = d;
	}

	function isToday(d: Date) {
		const today = new Date();
		return (
			d.getDate() === today.getDate() &&
			d.getMonth() === today.getMonth() &&
			d.getFullYear() === today.getFullYear()
		);
	}
	import { onMount } from 'svelte';

	let scrollContainer = $state<HTMLElement>();

	onMount(() => {
		// Scroll to 14:00 (approx 7h from start or index)?
		// Our day starts at 8:00. 14:00 is +6 hours.
		// Each hour is 120px. 6 * 120 = 720px.
		if (scrollContainer) {
			scrollContainer.scrollTo({ top: 720, behavior: 'smooth' });
		}
	});

	function getSlotColorClass(slot: AgendaSlot & { isMyBooking?: boolean }) {
		if (!slot.is_booked) {
			// Free: White with Blue border (Clean look)
			return 'bg-white border-blue-400 border-2 text-blue-700 hover:bg-blue-50';
		}

		// Guest View: Is it MINE?
		if (slot.isMyBooking) {
			return 'bg-green-100 border-green-600 border text-green-900 shadow-md';
		}

		// Booked (Teacher or Other)
		return 'bg-orange-100 border-orange-500 border text-orange-900';
	}

	function handleColumnClick(dayIndex: number, e: MouseEvent) {
		if (!onEmptySlotClick) return;

		// Calculate time from Y position
		// HACK: We assume .relative parent. `e.offsetY` gives pos in the column.
		// 120px per hour.
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const y = e.clientY - rect.top; // Relative Y

		const hoursFromStart = y / HOUR_HEIGHT;
		const hour = START_HOUR + Math.floor(hoursFromStart);
		const minutes = Math.floor((hoursFromStart % 1) * 60);

		// Round to nearest 15?
		const roundedMinutes = Math.round(minutes / 15) * 15;

		const targetDate = new Date(weekDays[dayIndex]);
		targetDate.setHours(hour, roundedMinutes, 0, 0);

		onEmptySlotClick(targetDate);
	}
</script>

<div class="flex h-full flex-col">
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-2xl font-bold capitalize text-gray-700">
			{startOfWeek.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
		</h2>
		<div class="flex gap-2">
			<button onclick={prevWeek} class="rounded p-2 hover:bg-gray-100">◀️</button>
			<button
				onclick={() => (currentDate = new Date())}
				class="text-sm font-bold text-indigo-600 hover:underline">Aujourd'hui</button
			>
			<button onclick={nextWeek} class="rounded p-2 hover:bg-gray-100">▶️</button>
		</div>
	</div>

	<div class="relative flex flex-1 overflow-auto rounded-lg border" bind:this={scrollContainer}>
		<!-- Time Column -->
		<div class="w-16 flex-shrink-0 border-r bg-gray-50">
			<div class="h-10"></div>
			<!-- Header spacer -->
			{#each hours as hour}
				<div
					class="relative w-full pr-2 text-right text-xs text-gray-400"
					style="height: {HOUR_HEIGHT}px"
				>
					<span class="absolute -top-2 right-2">{hour}h</span>
				</div>
			{/each}
		</div>

		<!-- Days -->
		<div class="flex flex-1 overflow-x-auto">
			{#each weekDays as day, i}
				<div class="group relative min-w-[100px] flex-1 border-r">
					<!-- Day Header -->
					<div
						class="sticky top-0 z-10 flex h-10 items-center justify-center border-b bg-gray-50
                                {isToday(day) ? 'bg-indigo-50 font-bold text-indigo-600' : ''}"
					>
						<div class="text-center">
							<div class="text-sm font-medium uppercase">
								{day.toLocaleDateString('fr-FR', { weekday: 'short' })}
							</div>
							<div class="text-lg">{day.getDate()}</div>
						</div>
					</div>

					<!-- Clickable Background -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div
						class="absolute inset-0 top-10 z-0 cursor-crosshair"
						onclick={(e) => handleColumnClick(i, e)}
						role="button"
						tabindex="0"
					></div>

					<!-- Grid Lines -->
					{#each hours as _}
						<div
							class="pointer-events-none border-b border-dashed border-gray-100"
							style="height: {HOUR_HEIGHT}px"
						></div>
					{/each}

					<!-- Slots -->
					{#if slotsByDay[i]}
						{#each slotsByDay[i] as slot}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<div
								class="absolute left-1 right-1 cursor-pointer overflow-hidden rounded p-1 text-xs shadow-sm transition-all hover:z-20 hover:scale-105
                                {getSlotColorClass(slot)} 
                                {new Date(slot.end_time) < new Date()
									? 'opacity-50 grayscale'
									: ''}"
								style={getSlotStyle(slot)}
								onclick={(e) => {
									e.stopPropagation();
									if (onSlotClick) {
										onSlotClick(slot);
									}
								}}
								role="button"
								tabindex="0"
							>
								<div class="font-bold">
									{new Date(slot.start_time).toLocaleTimeString('fr-FR', {
										hour: '2-digit',
										minute: '2-digit'
									})} -
									{new Date(slot.end_time).toLocaleTimeString('fr-FR', {
										hour: '2-digit',
										minute: '2-digit'
									})}
								</div>
								{#if slot.is_booked}
									<div class="mt-1 flex flex-col font-bold leading-tight">
										<span>🔒 {slot.studentName || 'Réservé'}</span>
										{#if slot.studentDetail}
											<span class="text-[10px] font-normal text-indigo-800"
												>({slot.studentDetail.firstName} {slot.studentDetail.lastName})</span
											>
										{/if}
									</div>
								{:else}
									<div class="mt-1 opacity-75">Libre</div>
								{/if}
							</div>
						{/each}
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
