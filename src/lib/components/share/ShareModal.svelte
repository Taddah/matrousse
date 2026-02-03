<script lang="ts">
	import { arrayBufferToBase64, encryptionKey } from '$lib/crypto';
	import { enrichStudentsWithGuestNotes, generateSecureSharePayload } from '$lib/services/sharing';
	import { notifications } from '$lib/stores/notifications';
	import { deserialize } from '$app/forms';
	import type { Student } from '$lib/types';
	import { get } from 'svelte/store';
	import PaperModal from '../ui/PaperModal.svelte';
	import StickerButton from '../ui/StickerButton.svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import CheckIcon from '$lib/components/icons/CheckIcon.svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		students: Student[];
	}

	let { isOpen, onClose, students }: Props = $props();

	let duration = $state('24h'); // 1h, 24h, 7d
	let recipientName = $state('');
	let generatedLink = $state(null as string | null);
	let loading = $state(false);

	const options = [
		{ value: '1h', label: '1 heure' },
		{ value: '24h', label: '24 heures' },
		{ value: '7d', label: '7 jours' },
		{ value: '14d', label: '14 jours' },
		{ value: '30d', label: '30 jours' }
	];

	function getExpirationDate(duration: string): string {
		const now = new SvelteDate();
		switch (duration) {
			case '1h':
				now.setHours(now.getHours() + 1);
				break;
			case '7d':
				now.setDate(now.getDate() + 7);
				break;
			case '14d':
				now.setDate(now.getDate() + 14);
				break;
			case '30d':
				now.setDate(now.getDate() + 30);
				break;
			case '24h':
			default:
				now.setDate(now.getDate() + 1);
		}
		return now.toISOString();
	}

	/**
	 * Generates a secure share link for the selected students.
	 *
	 * The process involves several steps:
	 * 1. Data Enrichment: If a master key is present, guest notes are retrieved and added to the students.
	 * 2. Encryption (ZKh): A payload containing the students is created. A unique share key is generated client-side. The data is encrypted with this key.
	 * 3. Storage: The encrypted blob (without the key) is sent to the server via a Server Action to be stored in the database with an expiration date.
	 * 4. Link Construction: The share ID returned by the server is combined with the base URL and the decryption key (which is added in the URL fragment #, thus never sent to the server) to form the final link.
	 */
	async function handleGenerateLink() {
		if (!recipientName.trim()) {
			notifications.send('Veuillez indiquer le nom du destinataire.', 'error');
			return;
		}

		try {
			const masterKey = get(encryptionKey);
			let studentsToShare = students;

			if (masterKey) {
				studentsToShare = await enrichStudentsWithGuestNotes(students, masterKey);
			}

			const { rawKey, encryptedBlob, ownerRecoveryToken } = await generateSecureSharePayload(
				{ students: studentsToShare },
				masterKey,
				'student_share',
				recipientName.trim()
			);

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

			if (result.type !== 'success') {
				let message = 'Erreur lors de la sauvegarde';
				if (result.type === 'error' && result.error) {
					const err = result.error as { message?: string };
					message = err.message || message;
				}
				throw new Error(message);
			}

			const shareId = result.data?.id as string | undefined;

			if (!shareId) throw new Error('ID manquant dans la réponse');

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

	function noAnimation() {
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
						placeholder="Ex: Amandine, Mr Martin..."
						class="font-hand w-full rounded-md border-2 border-indigo-100 p-2 text-xl focus:border-indigo-500 focus:outline-none"
					/>
				</div>

				<ul class="mb-4 list-disc pl-5 text-base text-gray-600">
					{#each students.slice(0, 5) as student (student.id)}
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
					{#each options as option (option.value)}
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
					<CheckIcon />
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
