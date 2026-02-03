<script lang="ts">
	import { arrayBufferToBase64, encryptionKey } from '$lib/crypto';
	import { enrichStudentsWithGuestNotes, generateSecureSharePayload } from '$lib/services/sharing';
	import { notifications } from '$lib/stores/notifications';
	import { deserialize } from '$app/forms';
	import type { Student } from '$lib/types';
	import { get } from 'svelte/store';
	import PaperModal from '../ui/PaperModal.svelte';
	import StickerButton from '../ui/StickerButton.svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		students: Student[];
		currentUserId?: string;
	}

	let { isOpen, onClose, students, currentUserId }: Props = $props();

	let duration = $state('24h'); // 1h, 24h, 7d
	let recipientName = $state('');
	let generatedLink = $state(null as string | null);
	let loading = $state(false);

	const options = [
		{ value: '1h', label: '1 heure' },
		{ value: '24h', label: '24 heures' },
		{ value: '7d', label: '7 jours' }
	];

	function getExpirationDate(duration: string): string {
		const now = new Date();
		switch (duration) {
			case '1h':
				now.setHours(now.getHours() + 1);
				break;
			case '7d':
				now.setDate(now.getDate() + 7);
				break;
			case '24h':
			default:
				now.setDate(now.getDate() + 1);
		}
		return now.toISOString();
	}

	async function handleGenerateLink() {
		if (!recipientName.trim()) {
			notifications.send('Veuillez indiquer le nom du destinataire.', 'error');
			return;
		}

		try {
			const masterKey = get(encryptionKey);

			// 1. Enrich students with guest notes
			// If we don't have the master key, we skip enrichment (shouldn't happen for owner)
			let studentsToShare = students;
			if (masterKey) {
				studentsToShare = await enrichStudentsWithGuestNotes(students, masterKey);
			}

			// 2. Generate secure payload
			// The service wraps data in a 'data' property.
			// We pass the students array. The receiver should expect { type, data: students, ... } OR { type, data: { students }, ... }
			// Original: { students: [...] } at root.
			// Let's pass { students: studentsToShare } as the data payload.
			const { rawKey, encryptedBlob, ownerRecoveryToken } = await generateSecureSharePayload(
				{ students: studentsToShare },
				masterKey,
				'student_share',
				recipientName.trim()
			);

			// 3. Upload to Supabase via Server Action
			const formData = new FormData();
			formData.append('encrypted_blob', encryptedBlob);
			if (ownerRecoveryToken) {
				formData.append('owner_recovery_token', JSON.stringify(ownerRecoveryToken));
			}
			formData.append('recipient_name', recipientName.trim());
			formData.append('expires_at', getExpirationDate(duration));

			const response = await fetch('/app/ma-classe?/generateShareLink', {
				method: 'POST',
				body: formData
			});

			const result = deserialize(await response.text());

			if (result.type === 'failure' || result.type === 'error') {
				// @ts-ignore
				throw new Error(result.error?.message || 'Erreur lors de la sauvegarde');
			}

			// @ts-ignore
			const shareId = result.data?.id;

			if (!shareId) throw new Error('ID manquant dans la réponse');

			// 6. Construct Link
			const baseUrl = window.location.origin;
			const keyBase64 = arrayBufferToBase64(rawKey);
			// URL format: /share/[id]#[key]
			generatedLink = `${baseUrl}/share/${shareId}#${keyBase64}`;

			notifications.send('Lien sécurisé généré !', 'success');
			notifications.send('Les notes invitées ont été incluses.', 'info');
		} catch (err) {
			console.error(err);
			notifications.send('Erreur lors de la génération du lien.', 'error');
		} finally {
			loading = false;
		}
	}

	function copyLink() {
		if (generatedLink) {
			navigator.clipboard.writeText(generatedLink);
			notifications.send('Lien copié !', 'success');
		}
	}

	function resetAndClose() {
		generatedLink = null;
		recipientName = '';
		loading = false;
		onClose();
	}

	function noAnimation(_node: Element, _params: any) {
		return { duration: 0 };
	}
</script>

<PaperModal
	{isOpen}
	onClose={resetAndClose}
	title="Partager en lieu sûr 🔒"
	variant="blue"
	send={noAnimation}
	receive={noAnimation}
>
	<div class="space-y-6">
		{#if !generatedLink}
			<div>
				<p class="mb-4">
					Vous allez partager un accès sécurisé à <strong
						>{students.length} élève{students.length > 1 ? 's' : ''}</strong
					>.
				</p>

				<div class="mb-4">
					<label for="recipient" class="mb-2 block font-bold text-gray-700"
						>Pour qui est ce lien ?</label
					>
					<input
						type="text"
						id="recipient"
						bind:value={recipientName}
						placeholder="Ex: Mme Dupont, Orthophoniste..."
						class="font-hand w-full rounded-md border-2 border-indigo-100 p-2 text-xl focus:border-indigo-500 focus:outline-none"
					/>
				</div>

				<ul class="mb-4 list-disc pl-5 text-base text-gray-600">
					{#each students.slice(0, 5) as student}
						<li>{student.firstName} {student.lastName}</li>
					{/each}
					{#if students.length > 5}
						<li>... et {students.length - 5} autres.</li>
					{/if}
				</ul>
				<p class="text-sm text-gray-500">
					Cette personne pourra consulter les fiches et ajouter des notes, mais ne pourra pas
					modifier l'identité des élèves.
				</p>
			</div>

			<div>
				<label for="duration" class="mb-2 block font-bold text-gray-700"
					>Combien de temps le lien est-il valide ?</label
				>
				<div class="flex gap-4">
					{#each options as option}
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="radio"
								name="duration"
								value={option.value}
								bind:group={duration}
								class="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
							/>
							<span class="text-lg">{option.label}</span>
						</label>
					{/each}
				</div>
			</div>

			<div class="flex justify-end pt-4">
				<StickerButton variant="green" onclick={handleGenerateLink} disabled={loading}>
					{loading ? 'Chiffrement en cours...' : 'Générer le lien sécurisé'}
				</StickerButton>
			</div>
		{:else}
			<div class="flex flex-col items-center space-y-4 text-center">
				<div class="rounded-full bg-green-100 p-3 text-green-600">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-8 w-8"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>
				<h3 class="font-hand text-2xl font-bold">Lien prêt !</h3>
				<p>Envoyez ce lien à votre collègue. Il contient la clé de déchiffrement.</p>

				<div class="flex w-full items-center gap-2 rounded border border-gray-200 bg-gray-50 p-2">
					<input
						readonly
						value={generatedLink}
						class="w-full bg-transparent text-sm text-gray-600 focus:outline-none"
						onclick={(e) => e.currentTarget.select()}
					/>
				</div>

				<StickerButton variant="indigo" onclick={copyLink}>Copier le lien</StickerButton>
			</div>
		{/if}
	</div>
</PaperModal>
