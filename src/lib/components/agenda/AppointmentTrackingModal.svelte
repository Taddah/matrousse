<script lang="ts">
	import PaperModal from '$lib/components/ui/PaperModal.svelte';
	import StickerButton from '$lib/components/ui/StickerButton.svelte';
	import EmailSender from '$lib/components/share/EmailSender.svelte';
	import {
		encryptionKey,
		arrayBufferToBase64,
		base64ToUint8Array,
		importRawKey,
		decryptData
	} from '$lib/crypto';
	import { get } from 'svelte/store';
	import { notifications } from '$lib/stores/notifications';
	import { enhance, deserialize } from '$app/forms';

	interface TrackingItem {
		id: string;
		recipient_name: string;
		created_at: string;
		expires_at: string;
		is_booked: boolean;
		booked_slot_date: string | null;
		owner_recovery_token: any;
		encrypted_blob: string;
	}

	let {
		isOpen,
		onClose,
		trackingData = []
	} = $props<{
		isOpen: boolean;
		onClose: () => void;
		trackingData: TrackingItem[];
	}>();

	let searchQuery = $state('');
	let filteredData = $derived(
		trackingData.filter((item: TrackingItem) =>
			item.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	// Resend Logic
	let resendTarget = $state<TrackingItem | null>(null);
	let reconstructedLink = $state<string | null>(null);

	async function prepareResend(item: TrackingItem) {
		try {
			const masterKey = get(encryptionKey);
			if (!masterKey || !item.owner_recovery_token) {
				notifications.send('Clé de chiffrement manquante ou partage invalide.', 'error');
				return;
			}

			// Decrypt the share key
			const recoveryToken = item.owner_recovery_token; // likely JSON object from DB is parsed
			const recovered = (await decryptData(recoveryToken, masterKey)) as { key: string };

			if (recovered?.key) {
				const origin = window.location.origin;
				const link = `${origin}/share/agenda/${item.id}#${recovered.key}`;
				reconstructedLink = link;
				resendTarget = item;
			}
		} catch (e) {
			console.error('Failed to reconstruct link', e);
			notifications.send('Erreur lors de la récupération du lien.', 'error');
		}
	}

	function closeResend() {
		resendTarget = null;
		reconstructedLink = null;
	}

	// Bulk Selection Logic
	let selectedIds = $state(new Set<string>());
	let isAllSelected = $derived(
		filteredData.length > 0 && filteredData.every((item: TrackingItem) => selectedIds.has(item.id))
	);

	function toggleSelectAll() {
		if (isAllSelected) {
			selectedIds = new Set();
		} else {
			selectedIds = new Set(filteredData.map((item: TrackingItem) => item.id));
		}
	}

	function toggleSelection(id: string) {
		const newSet = new Set(selectedIds);
		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}
		selectedIds = newSet;
	}

	// Bulk Actions
	async function handleBulkResend() {
		const itemsToResend = filteredData.filter(
			(item: TrackingItem) => selectedIds.has(item.id) && !item.is_booked
		);
		if (itemsToResend.length === 0) return;

		// Decrypt keys for all selected items
		const recipients = [];
		const masterKey = get(encryptionKey);

		if (!masterKey) {
			notifications.send('Clé de chiffrement manquante.', 'error');
			return;
		}

		for (const item of itemsToResend) {
			try {
				if (item.owner_recovery_token) {
					const recovered = (await decryptData(item.owner_recovery_token, masterKey)) as {
						key: string;
					};
					if (recovered?.key) {
						const origin = window.location.origin;
						const link = `${origin}/share/agenda/${item.id}#${recovered.key}`;
						recipients.push({
							email: '',
							name: item.recipient_name,
							data: { link }
						});
					}
				}
			} catch (e) {
				console.error(`Failed to decrypt for ${item.recipient_name}`, e);
			}
		}

		if (recipients.length > 0) {
			// Reuse the single resend modal interface but with multiple recipients
			// We need to adapt the single resend logic to handle this list
			// Effectively we can open a custom "Bulk Email Sender" or reuse the existing one
			itemToResendList = recipients;
			isBulkResendOpen = true;
		} else {
			notifications.send('Aucun destinataire valide trouvé (déjà réservé ou erreur).', 'error');
		}
	}

	let isBulkResendOpen = $state(false);
	let itemToResendList = $state<any[]>([]);

	async function handleBulkDelete() {
		if (!confirm(`Voulez-vous vraiment supprimer ${selectedIds.size} invitations ?`)) return;

		let successCount = 0;
		// We'll use the form action endpoint via fetch for each ID
		// Ideally we'd have a bulk delete endpoint, but we can iterate for now
		for (const id of selectedIds) {
			const formData = new FormData();
			formData.append('id', id);
			try {
				const response = await fetch('?/deleteShareLink', {
					method: 'POST',
					body: formData
				});
				const result = deserialize(await response.text());
				if (result.type === 'success') {
					successCount++;
				}
			} catch (e) {
				console.error(`Failed to delete ${id}`, e);
			}
		}

		if (successCount > 0) {
			notifications.send(`${successCount} invitations supprimées.`, 'success');
			// Refresh page to update list or manually update local state?
			// Since we use server data prop, best is invalidateAll or reload
			window.location.reload();
		} else {
			notifications.send('Erreur lors de la suppression.', 'error');
		}
	}

	const defaultSubject = 'Rappel : Rendez-vous parent-professeur';
	const defaultBody = `Bonjour {{name}},

Sauf erreur de ma part, vous n'avez pas encore réservé votre créneau.
Voici le lien pour le faire :
{{link}}

Cordialement,
Le professeur`;
</script>

{#if resendTarget && reconstructedLink}
	<PaperModal isOpen={true} onClose={closeResend} title="Relancer l'invitation" variant="indigo">
		<EmailSender
			recipients={[
				{
					email: '', // We don't store parent email in shared_session yet, user might need to fill or copy
					name: resendTarget.recipient_name,
					data: { link: reconstructedLink }
				}
			]}
			{defaultSubject}
			{defaultBody}
			onSend={() => {
				notifications.send('Relance prête !', 'success');
				closeResend();
			}}
		/>
		<div class="flex justify-end pt-2">
			<button class="text-sm text-gray-400 underline hover:text-gray-600" onclick={closeResend}>
				Annuler
			</button>
		</div>
	</PaperModal>
{/if}

{#if isBulkResendOpen}
	<PaperModal
		isOpen={true}
		onClose={() => (isBulkResendOpen = false)}
		title="Relance groupée"
		variant="indigo"
	>
		<EmailSender
			recipients={itemToResendList}
			{defaultSubject}
			{defaultBody}
			onSend={(count) => {
				notifications.send(`${count} emails envoyés !`, 'success');
				isBulkResendOpen = false;
				selectedIds = new Set(); // Clear selection
			}}
		/>
		<div class="flex justify-end pt-2">
			<button
				class="text-sm text-gray-400 underline hover:text-gray-600"
				onclick={() => (isBulkResendOpen = false)}
			>
				Annuler
			</button>
		</div>
	</PaperModal>
{/if}

<PaperModal {isOpen} {onClose} title="Suivi des invitations" variant="gray">
	<div class="space-y-4">
		<input
			type="search"
			placeholder="Filtrer par nom..."
			bind:value={searchQuery}
			class="w-full rounded border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
		/>

		{#if selectedIds.size > 0}
			<div
				class="flex items-center justify-between rounded bg-indigo-50 p-2 text-sm text-indigo-900"
			>
				<span class="font-bold">{selectedIds.size} sélectionné(s)</span>
				<div class="flex gap-2">
					<button
						class="rounded px-2 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
						onclick={handleBulkResend}
					>
						✉️ Relancer
					</button>
					<button
						class="rounded px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-100"
						onclick={handleBulkDelete}
					>
						🗑️ Supprimer
					</button>
				</div>
			</div>
		{/if}

		<div class="max-h-96 overflow-y-auto rounded border">
			<table class="w-full text-left text-sm">
				<thead class="bg-gray-50 text-gray-500">
					<tr>
						<th class="w-8 p-2">
							<input
								type="checkbox"
								checked={isAllSelected}
								onchange={toggleSelectAll}
								class="rounded text-indigo-600 focus:ring-indigo-500"
							/>
						</th>
						<th class="p-2 font-medium">Destinataire</th>
						<th class="p-2 font-medium">Envoyé le</th>
						<th class="p-2 font-medium">Statut</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each filteredData as item}
						<tr class="hover:bg-gray-50 {selectedIds.has(item.id) ? 'bg-indigo-50' : ''}">
							<td class="p-2">
								<input
									type="checkbox"
									checked={selectedIds.has(item.id)}
									onchange={() => toggleSelection(item.id)}
									class="rounded text-indigo-600 focus:ring-indigo-500"
								/>
							</td>
							<td class="p-2 font-bold text-gray-700">{item.recipient_name}</td>
							<td class="p-2 text-gray-500">
								{new Date(item.created_at).toLocaleDateString()}
							</td>
							<td class="p-2">
								{#if item.is_booked}
									<span
										class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700"
									>
										✅ Réservé
										{#if item.booked_slot_date}
											<br class="sm:hidden" />
											<span class="font-normal opacity-75">
												({new Date(item.booked_slot_date).toLocaleString('fr-FR', {
													day: 'numeric',
													month: 'short',
													hour: '2-digit',
													minute: '2-digit'
												})})
											</span>
										{/if}
									</span>
								{:else if new Date(item.expires_at) < new Date()}
									<span class="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
										Expiré
									</span>
								{:else}
									<span
										class="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700"
									>
										⏳ En attente
									</span>
								{/if}
							</td>
						</tr>
					{/each}
					{#if filteredData.length === 0}
						<tr>
							<td colspan="4" class="p-8 text-center text-gray-500">
								Aucune invitation trouvée.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>

		<div class="flex justify-end pt-2">
			<StickerButton variant="indigo" onclick={onClose}>Fermer</StickerButton>
		</div>
	</div>
</PaperModal>
