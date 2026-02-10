<script lang="ts">
	import EmailSender from '$lib/components/share/EmailSender.svelte';
	import PaperModal from '$lib/components/ui/PaperModal.svelte';
	import StickerButton from '$lib/components/ui/StickerButton.svelte';
	import { notifications } from '$lib/stores/notifications';
	import { encryptionKey, arrayBufferToBase64 } from '$lib/crypto';
	import { generateSecureSharePayload } from '$lib/services/sharing';
	import { deserialize } from '$app/forms';
	import { get } from 'svelte/store';
	import type { Student, Contact } from '$lib/types';

	let {
		isOpen,
		onClose,
		students = []
	} = $props<{
		isOpen: boolean;
		onClose: () => void;
		students: Student[];
	}>();

	let mode = $state<'link' | 'email'>('link');
	let loading = $state(false);
	let generatedLinks = $state<{ name: string; link: string; email: string; student: Student }[]>(
		[]
	);
	let selectedIds = $state<string[]>([]);
	let searchQuery = $state('');

	function reset() {
		mode = 'link';
		selectedIds = [];
		generatedLinks = [];
		loading = false;
		searchQuery = '';
		onClose();
	}

	let filteredStudents = $derived(
		students.filter((s: { firstName: string; lastName: string }) => {
			const query = searchQuery.toLowerCase();
			return s.firstName.toLowerCase().includes(query) || s.lastName.toLowerCase().includes(query);
		})
	);

	let studentsByGrade = $derived.by(() => {
		const groups: Record<string, Student[]> = {};
		for (const s of filteredStudents) {
			const g = s.grade || 'Sans niveau';
			if (!groups[g]) groups[g] = [];
			groups[g].push(s);
		}
		return groups;
	});

	let sortedGrades = $derived(Object.keys(studentsByGrade).sort());

	function isGradeSelected(grade: string) {
		const inGrade = studentsByGrade[grade];
		if (!inGrade || inGrade.length === 0) return false;
		return inGrade.every((s) => selectedIds.includes(s.id));
	}

	function isGradeIndeterminate(grade: string) {
		const inGrade = studentsByGrade[grade];
		if (!inGrade || inGrade.length === 0) return false;
		const count = inGrade.filter((s) => selectedIds.includes(s.id)).length;
		return count > 0 && count < inGrade.length;
	}

	function toggleGrade(grade: string, checked: boolean) {
		const inGrade = studentsByGrade[grade];
		const idsInGrade = inGrade.map((s) => s.id);
		if (checked) {
			// Add all not present
			const toAdd = idsInGrade.filter((id) => !selectedIds.includes(id));
			selectedIds = [...selectedIds, ...toAdd];
		} else {
			// Remove all
			selectedIds = selectedIds.filter((id) => !idsInGrade.includes(id));
		}
	}

	function toggleAllVisible() {
		const allVisibleIds = filteredStudents.map((s: { id: string }) => s.id);
		const allSelected = allVisibleIds.every((id: string) => selectedIds.includes(id));

		if (allSelected) {
			// Deselect visible
			selectedIds = selectedIds.filter((id) => !allVisibleIds.includes(id));
		} else {
			// Select all visible
			const unique = new Set([...selectedIds, ...allVisibleIds]);
			selectedIds = Array.from(unique);
		}
	}

	async function handleGenerate() {
		if (selectedIds.length === 0) return;
		loading = true;
		generatedLinks = [];

		const masterKey = get(encryptionKey);
		const targets = students.filter((s: { id: string }) => selectedIds.includes(s.id));
		const origin = window.location.origin;

		const promises = targets.map(
			async (student: { firstName: any; contacts: string | any[]; lastName: any }) => {
				try {
					const recipient = `Parent de ${student.firstName}`;
					const { rawKey, encryptedBlob, ownerRecoveryToken } = await generateSecureSharePayload(
						{ students: [student] },
						masterKey,
						'student_share',
						recipient
					);

					const formData = new FormData();
					formData.append('encrypted_blob', encryptedBlob);
					formData.append('recipient_name', recipient);
					// 90 days validity
					const now = new Date();
					now.setDate(now.getDate() + 90);
					formData.append('expires_at', now.toISOString());

					if (ownerRecoveryToken) {
						formData.append('owner_recovery_token', JSON.stringify(ownerRecoveryToken));
					}

					const response = await fetch('/app/ma-classe?/generateShareLink', {
						method: 'POST',
						body: formData
					});
					const result = deserialize(await response.text());

					if (result.type === 'success' && result.data?.id) {
						const keyBase64 = arrayBufferToBase64(rawKey);
						// Important: Link points to /share/agenda/...
						const link = `${origin}/share/agenda/${result.data.id}#${keyBase64}`;

						// Try to find email
						let email = '';
						if (student.contacts && student.contacts.length > 0) {
							email = student.contacts[0].email;
						}

						return { name: `${student.firstName} ${student.lastName}`, link, email, student };
					}
				} catch (e) {
					console.error(e);
				}
				return null;
			}
		);

		const results = await Promise.all(promises);
		generatedLinks = results.filter((r) => r !== null) as {
			name: string;
			link: string;
			email: string;
			student: any;
		}[];
		loading = false;

		if (generatedLinks.length > 0) {
			notifications.send(`${generatedLinks.length} liens générés !`, 'success');
		}
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		notifications.send('Copié !', 'success');
	}

	// Email Template
	const defaultSubject = 'Rendez-vous parent-professeur : {{studentFirstName}} {{studentLastName}}';
	const defaultBody = `Bonjour {{contactFirstName}} {{contactLastName}},

Voici le lien pour réserver votre créneau de rendez-vous pour {{studentFirstName}} {{studentLastName}} :
{{link}}

Cordialement,
Le professeur`;

	function indeterminate(node: HTMLInputElement, value: boolean) {
		node.indeterminate = value;
		$effect(() => {
			node.indeterminate = value;
		});
	}
</script>

<PaperModal {isOpen} onClose={reset} title="Partager l'agenda" variant="indigo">
	<div class="space-y-4">
		<!-- Tabs -->
		{#if generatedLinks.length === 0}
			<div class="flex border-b">
				<button
					class="border-b-2 px-4 py-2 font-bold transition-colors {mode === 'link'
						? 'border-indigo-600 text-indigo-700'
						: 'border-transparent text-gray-400 hover:text-gray-600'}"
					onclick={() => (mode = 'link')}
				>
					🔗 Copier les liens
				</button>
				<button
					class="border-b-2 px-4 py-2 font-bold transition-colors {mode === 'email'
						? 'border-indigo-600 text-indigo-700'
						: 'border-transparent text-gray-400 hover:text-gray-600'}"
					onclick={() => (mode = 'email')}
				>
					📧 Envoyer par email
				</button>
			</div>
		{/if}

		{#if generatedLinks.length === 0}
			<!-- Header Actions & List (Existing) -->
			<!-- ... (Keep same filter/list logic) -->
			<div class="flex flex-col gap-2 border-b pb-4">
				<input
					type="search"
					placeholder="Rechercher un élève..."
					bind:value={searchQuery}
					class="w-full rounded border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
				/>
				<div class="flex items-center justify-between">
					<span class="text-sm font-bold text-gray-500">
						{selectedIds.length} sélectionné(s)
					</span>
					<button
						class="text-sm font-bold text-indigo-600 hover:underline"
						onclick={toggleAllVisible}
					>
						{filteredStudents.length > 0 &&
						filteredStudents.every((s: { id: string }) => selectedIds.includes(s.id))
							? 'Tout désélectionner'
							: 'Tout sélectionner'}
					</button>
				</div>
			</div>

			<!-- List -->
			<div class="max-h-80 space-y-4 overflow-y-auto pr-1">
				{#each sortedGrades as grade}
					<div class="rounded-lg border border-gray-100 bg-gray-50/50">
						<!-- Grade Header -->
						<div class="flex items-center gap-2 border-b border-gray-100 bg-gray-100/50 p-2">
							<input
								type="checkbox"
								checked={isGradeSelected(grade)}
								use:indeterminate={isGradeIndeterminate(grade)}
								onclick={(e) => toggleGrade(grade, e.currentTarget.checked)}
								class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
							/>
							<h4 class="font-bold text-indigo-900">{grade}</h4>
							<span class="ml-auto text-xs text-gray-500"
								>{studentsByGrade[grade].length} élèves</span
							>
						</div>

						<!-- Students -->
						<div class="grid grid-cols-1 gap-2 p-2 pl-4 sm:grid-cols-2">
							{#each studentsByGrade[grade] as student}
								<label
									class="flex cursor-pointer items-center gap-2 rounded p-1 transition-all duration-200 hover:bg-white hover:shadow-sm"
								>
									<input
										type="checkbox"
										value={student.id}
										bind:group={selectedIds}
										class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
									/>
									<span class="text-sm text-gray-700">{student.firstName} {student.lastName}</span>
								</label>
							{/each}
						</div>
					</div>
				{/each}

				{#if sortedGrades.length === 0}
					<div class="py-8 text-center text-gray-500">
						Aucun élève trouvé pour "{searchQuery}".
					</div>
				{/if}
			</div>

			<div class="flex justify-end pt-4">
				<StickerButton
					variant="indigo"
					onclick={handleGenerate}
					disabled={loading || selectedIds.length === 0}
				>
					{loading
						? 'Génération...'
						: mode === 'email'
							? 'Préparer les emails'
							: 'Générer les liens'}
				</StickerButton>
			</div>
		{:else}
			<!-- RESULT VIEW -->
			{#if mode === 'link'}
				<div class="mb-4 text-center">
					<p class="text-lg font-bold text-green-600">Liens générés avec succès !</p>
					<p class="text-sm text-gray-500">
						Copiez les liens ci-dessous pour les transmettre aux parents.
					</p>
				</div>

				<div class="max-h-96 space-y-3 overflow-y-auto">
					{#each generatedLinks as item}
						<div class="flex items-center justify-between rounded border bg-gray-50 p-3">
							<span class="text-sm font-bold">{item.name}</span>
							<button
								class="rounded border bg-white px-3 py-1 text-sm font-bold text-indigo-600 hover:bg-indigo-50"
								onclick={() => copyToClipboard(item.link)}
							>
								Copier
							</button>
						</div>
					{/each}
				</div>

				<div class="flex justify-end pt-4">
					<StickerButton variant="gray" onclick={reset}>Fermer</StickerButton>
				</div>
			{:else}
				<!-- EMAIL MODE -->
				<EmailSender
					recipients={generatedLinks.map((l) => {
						const contact =
							l.student.contacts?.find((c: Contact) => c.email === l.email) ||
							l.student.contacts?.[0];
						return {
							email: l.email || '',
							name: contact ? `${contact.firstName} ${contact.lastName}` : l.name,
							data: {
								link: l.link,
								studentFirstName: l.student.firstName,
								studentLastName: l.student.lastName,
								contactFirstName: contact?.firstName || '',
								contactLastName: contact?.lastName || ''
							}
						};
					})}
					{defaultSubject}
					{defaultBody}
					onSend={(count) => {
						// Maybe close after send?
					}}
				/>
				<div class="flex justify-end pt-2">
					<button class="text-sm text-gray-400 underline hover:text-gray-600" onclick={reset}
						>Fermer sans envoyer</button
					>
				</div>
			{/if}
		{/if}
	</div>
</PaperModal>
