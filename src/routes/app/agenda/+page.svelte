<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { deserialize } from '$app/forms';
	import { get } from 'svelte/store';
	import SlotDetailsModal from '$lib/components/agenda/SlotDetailsModal.svelte';
	import { encryptionKey, decryptData, base64ToUint8Array, importRawKey } from '$lib/crypto';
	import WeekCalendar from '$lib/components/agenda/WeekCalendar.svelte';
	import CreateSlotModal from '$lib/components/agenda/CreateSlotModal.svelte';
	import ShareAgendaModal from '$lib/components/agenda/ShareAgendaModal.svelte';
	import StickerButton from '$lib/components/ui/StickerButton.svelte';
	import { notifications } from '$lib/stores/notifications';
	import AppointmentTrackingModal from '$lib/components/agenda/AppointmentTrackingModal.svelte';
	import type { AgendaSlot, Student } from '$lib/types';

	let { data } = $props();

	let slots = $state<AgendaSlot[]>(data.slots || []);
	// Initially empty or encrypted. We need to decrypt.
	let students = $state<Student[]>([]);

	$effect(() => {
		const key = get(encryptionKey);
		if (key && data.students) {
			decryptStudents(data.students, key);
		}
		if (key && slots.length > 0) {
			decryptSlotStudents(slots, key);
		}
	});

	async function decryptStudents(list: any[], key: CryptoKey) {
		const decrypted = [];
		for (const row of list) {
			try {
				if (row.encrypted_data) {
					const info = (await decryptData(row.encrypted_data, key)) as Partial<Student>;
					decrypted.push({ ...row, ...info });
				}
			} catch (e) {
				console.error(e);
			}
		}
		// Client-side sort
		decrypted.sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));
		students = decrypted as Student[];
	}

	async function decryptSlotStudents(slotList: AgendaSlot[], masterKey: CryptoKey) {
		// Create a new array reference to trigger updates if needed, though we are mutating objects inside $state
		// For deep reactivity in Svelte 5, direct mutation of properties works if they are state.
		// But slots is a $state array.

		for (const slot of slotList) {
			if (
				slot.is_booked &&
				slot.booked_by?.owner_recovery_token &&
				!slot.studentDetail &&
				!slot.loadingStudent
			) {
				slot.loadingStudent = true;
				try {
					// 1. Decrypt the share key using the master key
					const blob = JSON.parse(JSON.stringify(slot.booked_by.owner_recovery_token));
					// Supabase might return it as object already if it's JSON type

					// Wait, `owner_recovery_token` is a string (encrypted blob) representing { key: base64 }
					// Actually let's check sharing.ts
					// ownerRecoveryToken = await encryptData({ key: rawKeyBase64 }, masterKey);
					// So it's a string.

					const recoveryToken = slot.booked_by.owner_recovery_token;

					const recovered = (await decryptData(recoveryToken, masterKey)) as { key: string };

					if (recovered?.key) {
						const rawShareKey = base64ToUint8Array(recovered.key);
						const shareKey = await importRawKey(rawShareKey);

						// 2. Decrypt the payload using the share key
						const encryptedBlob = slot.booked_by.encrypted_blob;
						if (encryptedBlob) {
							const payload = (await decryptData(encryptedBlob, shareKey)) as {
								data: { students: Student[] };
							};
							if (payload?.data?.students?.[0]) {
								slot.studentDetail = payload.data.students[0];
							}
						}
					}
				} catch (e) {
					console.error('Failed to decrypt slot student info', e);
				} finally {
					slot.loadingStudent = false;
				}
			}
		}
	}

	let isCreateModalOpen = $state(false);
	let createModalInitialDate = $state<Date | null>(null);

	let isShareModalOpen = $state(false);
	let isTrackingModalOpen = $state(false);

	// Details Modal
	let selectedSlot = $state<AgendaSlot | null>(null);
	let isDetailsModalOpen = $state(false);

	function handleEmptySlotClick(date: Date) {
		createModalInitialDate = date;
		isCreateModalOpen = true;
	}

	async function handleSlotsSave(newSlots: Partial<AgendaSlot>[]) {
		const { data: saved, error } = await supabase.from('agenda_slots').insert(newSlots).select(`
                *,
                booked_by:shared_sessions(recipient_name)
            `);

		if (error) {
			console.error(error);
			notifications.send('Erreur lors de la sauvegarde.', 'error');
		} else if (saved) {
			notifications.send(`${saved.length} créneaux ajoutés !`, 'success');
			const formattedSaved = saved.map((s) => ({
				...s,
				studentName: s.booked_by?.recipient_name
			}));
			slots = [...slots, ...formattedSaved];
			isCreateModalOpen = false;
			createModalInitialDate = null;
		}
	}

	async function handleDeleteSlot(id: string) {
		const { error } = await supabase.from('agenda_slots').delete().eq('id', id);
		if (error) {
			console.error(error);
			notifications.send('Erreur lors de la suppression.', 'error');
		} else {
			notifications.send('Créneau supprimé.', 'success');
			slots = slots.filter((s) => s.id !== id);
			isDetailsModalOpen = false;
			selectedSlot = null;
		}
	}

	function onSlotClick(slot: AgendaSlot) {
		selectedSlot = slot;
		isDetailsModalOpen = true;
	}
</script>

<svelte:head>
	<title>Agenda - Ma Trousse</title>
</svelte:head>

<div class="p-4 sm:p-8">
	<div class="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
		<h1 class="font-hand text-4xl font-bold text-indigo-900">Mon Agenda 📅</h1>
		<div class="flex gap-4">
			<StickerButton
				variant="green"
				onclick={() => {
					createModalInitialDate = null;
					isCreateModalOpen = true;
				}}
			>
				+ Ajouter des créneaux
			</StickerButton>
			<StickerButton variant="indigo" onclick={() => (isShareModalOpen = true)}>
				Partager l'agenda
			</StickerButton>
			<StickerButton variant="indigo" onclick={() => (isTrackingModalOpen = true)}>
				Suivi des invitations
			</StickerButton>
		</div>
	</div>

	<div class="min-h-[600px] rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5 sm:p-6">
		<WeekCalendar {slots} {onSlotClick} onEmptySlotClick={handleEmptySlotClick} />
	</div>
</div>

<CreateSlotModal
	isOpen={isCreateModalOpen}
	onClose={() => (isCreateModalOpen = false)}
	onSave={handleSlotsSave}
	initialDate={createModalInitialDate}
/>

<ShareAgendaModal isOpen={isShareModalOpen} onClose={() => (isShareModalOpen = false)} {students} />

<AppointmentTrackingModal
	isOpen={isTrackingModalOpen}
	onClose={() => (isTrackingModalOpen = false)}
	trackingData={data.trackingData || []}
/>

<SlotDetailsModal
	isOpen={isDetailsModalOpen}
	onClose={() => (isDetailsModalOpen = false)}
	slot={selectedSlot}
	onDelete={handleDeleteSlot}
	onUpdate={async (id, updates) => {
		const formData = new FormData();
		formData.append('id', id);
		if (updates.notes !== undefined) formData.append('notes', updates.notes);

		const response = await fetch('?/updateAgendaSlot', {
			method: 'POST',
			body: formData
		});

		const result = deserialize(await response.text());
		if (result.type === 'success') {
			// Update local state
			slots = slots.map((s) => (s.id === id ? { ...s, ...updates } : s));
			if (selectedSlot && selectedSlot.id === id) {
				selectedSlot = { ...selectedSlot, ...updates };
			}
		} else {
			throw new Error('Failed to update slot');
		}
	}}
/>
```
