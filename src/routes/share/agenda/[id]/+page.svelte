<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { decryptData, importRawKey, base64ToUint8Array } from '$lib/crypto';
	import WeekCalendar from '$lib/components/agenda/WeekCalendar.svelte';
	import PaperModal from '$lib/components/ui/PaperModal.svelte';
	import StickerButton from '$lib/components/ui/StickerButton.svelte';
	import InfoPopup from '$lib/components/ui/InfoPopup.svelte';
	import type { AgendaSlot, Student } from '$lib/types';
	import { notifications } from '$lib/stores/notifications';

	let { data, form } = $props();

	// We receive slots. We need to process them for the calendar view.
	// For the Guest, 'is_booked' means booked by *someone else*.
	// UNLESS booked_by_session_id === data.session.id, then it's MY booking.

	let slots = $state<AgendaSlot[]>([]);
	let studentName = $state('Chargement...');
	let error = $state<string | null>(null);

	// Booking Modal
	let selectedSlot = $state<AgendaSlot | null>(null);
	let isBookingModalOpen = $state(false);
	let parentName = $state('');
	let loading = $state(false);

	onMount(async () => {
		try {
			const hash = window.location.hash.substring(1);
			if (!hash || !data.session) throw new Error('Lien incomplet');

			const rawKey = base64ToUint8Array(hash);
			const shareKey = await importRawKey(rawKey);

			const payload = (await decryptData(data.session.encrypted_blob, shareKey)) as {
				type: string;
				data: { students: Student[] };
				recipientName?: string;
			};

			if (payload.data?.students?.[0]) {
				const s = payload.data.students[0];
				studentName = `${s.firstName} ${s.lastName}`;
			}

			if (payload.recipientName) {
				parentName = payload.recipientName;
			}

			// Mark my slots
			slots = data.slots.map((s: AgendaSlot) => ({
				...s,
				// Client-side trick: if it's booked by ME, I want to see it green.
				// But the public `is_booked` is generic.
				// Wait, if I am the guest, all I see is "Booked".
				// I need to know if it's ME.
				// The server returns `booked_by_session_id`.
				isMyBooking: s.booked_by_session_id === data.session.id
			}));
		} catch (e) {
			console.error(e);
			error = 'Impossible de lire les données sécurisées.';
			studentName = 'Inconnu';
		}
	});

	function handleSlotClick(slot: AgendaSlot) {
		if (slot.is_booked && slot.booked_by_session_id !== data.session.id) {
			notifications.send('Ce créneau est déjà réservé.', 'info');
			return;
		}

		selectedSlot = slot;
		isBookingModalOpen = true;
	}

	$effect(() => {
		if (form?.success) {
			isBookingModalOpen = false;
			notifications.send('Réservation confirmée !', 'success');
			// Optimistic update or reload? The load function runs again on form submit
			// But we need to update our local state slots to reflect changes if strictly relying on load?
			// Actually SvelteKit re-runs load, so data.slots is fresh.
			// We just need to re-map in effect? No, onMount runs once.
			// Better to make `slots` derived from `data.slots` or update it.
			slots = data.slots.map((s: AgendaSlot) => ({
				...s,
				isMyBooking: s.booked_by_session_id === data.session.id
			}));
		} else if (form?.error) {
			notifications.send(form.error, 'error');
			isBookingModalOpen = false;
		}
	});
</script>

<svelte:head>
	<title>Réserver un créneau</title>
</svelte:head>

<div class="min-h-screen bg-[#fdfbf7] p-4 font-sans text-gray-900 sm:p-8">
	<div class="mx-auto max-w-5xl">
		<header
			class="mb-8 flex flex-col items-center justify-between gap-4 border-b-2 border-indigo-100 pb-4 sm:flex-row"
		>
			<div class="flex items-center gap-4">
				<h1 class="font-hand text-3xl font-bold text-indigo-900">Agenda Professeur 📅</h1>
				<InfoPopup title="Mode Réservation">
					<p>
						Vous consultez les disponibilités de l'enseignant pour <strong>{studentName}</strong>.
					</p>
				</InfoPopup>
			</div>

			<div class="rounded-full bg-white px-4 py-1 shadow-sm ring-1 ring-indigo-100">
				<span class="text-sm font-bold uppercase tracking-wider text-gray-500">Pour :</span>
				<span class="font-hand ml-2 text-xl font-bold text-indigo-800">{studentName}</span>
			</div>
		</header>

		<main>
			{#if error}
				<div class="rounded-xl bg-red-50 p-8 text-center text-red-600">
					{error}
				</div>
			{:else}
				<div class="min-h-[600px] rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5 sm:p-6">
					<!-- Custom WeekCalendar wrapper or modify WeekCalendar to support "click" event dispatch -->
					<!-- For now, we inject logic via checking if we can reuse the component.
                           The existing component has an `onclick` that alerts.
                           Ideally we should pass an `onSlotClick` prop. 
                           I will modifying WeekCalendar shortly to accept a callback.
                      -->
					<div
						class="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-white/80 opacity-50"
						class:hidden={studentName !== 'Chargement...'}
					>
						<span>Déchiffrement...</span>
					</div>

					<!-- We need to modify WeekCalendar to use our slots and handle clicks properly -->
					<div class="relative h-full">
						<!-- HACK: Overriding the component behavior requires editing it. 
                                I will update WeekCalendar to accept an `onSlotClick` prop.
                           -->
						<WeekCalendar {slots} onSlotClick={handleSlotClick} />

						<!-- Overlay for click handling if component controls aren't enough? 
                                No, I must update the component. It's cleaner. -->
					</div>
				</div>
			{/if}
		</main>
	</div>
</div>

<!-- Booking Modal -->
{#if selectedSlot}
	<PaperModal
		isOpen={isBookingModalOpen}
		onClose={() => (isBookingModalOpen = false)}
		title="Confirmr la réservation"
	>
		<form
			method="POST"
			action="?/book"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					update();
				};
			}}
		>
			<input type="hidden" name="slot_id" value={selectedSlot.id} />

			<div class="space-y-4">
				<p>
					Vous souhaitez réserver le créneau du
					<strong>{new Date(selectedSlot.start_time).toLocaleDateString()}</strong>
					de
					<strong
						>{new Date(selectedSlot.start_time).toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit'
						})}</strong
					>
					à
					<strong
						>{new Date(selectedSlot.end_time).toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit'
						})}</strong
					>.
				</p>

				<div>
					<label for="name" class="mb-1 block font-bold text-gray-700">Votre nom (Parent)</label>
					<input
						type="text"
						name="recipient_name"
						bind:value={parentName}
						placeholder="Ex: Mme Dupont"
						class="font-hand w-full rounded border p-2 text-lg"
						required
					/>
				</div>

				<div class="flex justify-end gap-2 pt-4">
					<StickerButton type="button" variant="gray" onclick={() => (isBookingModalOpen = false)}
						>Annuler</StickerButton
					>
					<StickerButton type="submit" variant="green" disabled={loading}>
						{loading ? 'Validation...' : 'Confirmer la réservation'}
					</StickerButton>
				</div>
			</div>
		</form>
	</PaperModal>
{/if}
