<script lang="ts">
	import PaperModal from '$lib/components/ui/PaperModal.svelte';
	import StickerButton from '$lib/components/ui/StickerButton.svelte';
	import type { AgendaSlot } from '$lib/types';
	import { notifications } from '$lib/stores/notifications';
	import { goto } from '$app/navigation';

	let { isOpen, onClose, slot, onDelete, onUpdate } = $props<{
		isOpen: boolean;
		onClose: () => void;
		slot: AgendaSlot | null;
		onDelete: (id: string) => void;
		onUpdate: (id: string, updates: Partial<AgendaSlot>) => void;
	}>();

	let loading = $state(false);
	let notes = $state('');

	$effect(() => {
		if (isOpen && slot) {
			notes = slot.notes || '';
		}
	});

	async function handleSaveNotes() {
		if (!slot) return;
		loading = true;
		try {
			await onUpdate(slot.id, { notes });
			notifications.send('Notes enregistrées', 'success');
		} catch (e) {
			console.error(e);
			notifications.send("Erreur lors de l'enregistrement", 'error');
		} finally {
			loading = false;
		}
	}

	async function handleDelete() {
		if (!slot) return;
		if (!confirm('Voulez-vous vraiment supprimer ce créneau ?')) return;

		loading = true;
		try {
			await onDelete(slot.id);
			onClose();
		} finally {
			loading = false;
		}
	}
</script>

<PaperModal {isOpen} {onClose} title="Détails du créneau">
	{#if slot}
		<div class="space-y-6">
			<!-- (Date & Heure section remains same) -->
			<!-- Date & Heure -->
			<div class="flex items-center gap-4 border-b pb-4">
				<div
					class="flex h-16 w-16 flex-col items-center justify-center rounded-xl bg-indigo-100 text-indigo-800"
				>
					<span class="text-xs font-bold uppercase"
						>{new Date(slot.start_time).toLocaleDateString('fr-FR', { weekday: 'short' })}</span
					>
					<span class="text-2xl font-bold">{new Date(slot.start_time).getDate()}</span>
				</div>
				<div>
					<p class="text-lg font-bold text-gray-800">
						{new Date(slot.start_time).toLocaleTimeString('fr-FR', {
							hour: '2-digit',
							minute: '2-digit'
						})} -
						{new Date(slot.end_time).toLocaleTimeString('fr-FR', {
							hour: '2-digit',
							minute: '2-digit'
						})}
					</p>
					<p class="text-sm text-gray-500">
						{new Date(slot.start_time).toLocaleDateString('fr-FR', {
							day: 'numeric',
							month: 'long',
							year: 'numeric'
						})}
					</p>
				</div>
			</div>

			<!-- Réservation -->
			{#if slot.is_booked}
				<div class="rounded-xl bg-green-50 p-4 ring-1 ring-green-100">
					<h3 class="font-hand mb-2 text-xl font-bold text-green-800">Réservé par</h3>
					<div class="space-y-1">
						<div class="flex items-center gap-2">
							<span class="font-bold text-gray-600">Parent :</span>
							<span class="text-lg font-bold text-gray-900"
								>{slot.booked_by?.recipient_name || 'Inconnu'}</span
							>
						</div>
						{#if slot.studentDetail}
							<div class="flex items-center gap-2">
								<span class="font-bold text-gray-600">Élève :</span>
								<button
									class="flex items-center gap-1 text-lg font-bold text-indigo-600 hover:underline"
									onclick={() => {
										if (slot.studentDetail?.id) {
											goto(`/app/ma-classe/${slot.studentDetail.id}`);
										} else {
											notifications.send('Erreur: ID élève manquant', 'error');
										}
									}}
								>
									{slot.studentDetail.firstName}
									{slot.studentDetail.lastName}
									<span class="text-xs">↗</span>
								</button>
							</div>
						{:else if slot.loadingStudent}
							<div class="animate-pulse text-sm text-gray-400">
								Déchiffrement des infos élève...
							</div>
						{/if}
					</div>
				</div>

				<!-- Notes Section (Only for booked slots typically, or all?) Requirement: "Quand le prof clique sur un rdv réservé" -->
				<div>
					<label for="slot-notes" class="block text-sm font-bold text-gray-700"
						>Notes personnelles</label
					>
					<div class="mt-1">
						<textarea
							id="slot-notes"
							rows="3"
							bind:value={notes}
							class="w-full rounded border border-gray-300 p-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
							placeholder="Notes pour ce rendez-vous (visible uniquement par vous)"
						></textarea>
					</div>
					<div class="mt-2 flex justify-end">
						<StickerButton
							variant="indigo"
							onclick={handleSaveNotes}
							disabled={loading || notes === (slot.notes || '')}
						>
							Enregistrer les notes
						</StickerButton>
					</div>
				</div>
			{:else}
				<div class="rounded-xl bg-gray-50 p-4 text-center text-gray-500">Ce créneau est libre.</div>
			{/if}

			<!-- Actions -->
			<div class="flex justify-end gap-2 border-t pt-4">
				<StickerButton variant="gray" onclick={onClose}>Fermer</StickerButton>
				<StickerButton variant="red" onclick={handleDelete} disabled={loading}>
					{loading ? 'Suppression...' : 'Supprimer'}
				</StickerButton>
			</div>
		</div>
	{/if}
</PaperModal>
