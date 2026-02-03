<script lang="ts">
	import { get } from 'svelte/store';
	import {
		encryptionKey,
		decryptData,
		encryptData,
		importRawKey,
		base64ToUint8Array
	} from '$lib/crypto';
	import { supabase } from '$lib/supabase';
	import { notifications } from '$lib/stores/notifications';
	import StudentDetailBoard from '$lib/components/ma-classe/StudentDetailBoard.svelte';
	import type { Student, JournalEntry } from '$lib/types';
	import { SvelteMap } from 'svelte/reactivity';

	let { data } = $props();

	let student: Student | null = $state(null);
	let loading = $state(true);
	let saving = $state(false);

	/**
	 * Main effect: Decrypts student data and loads guest notes.
	 * Uses Zero-Knowledge principle (local key derivation) to guarantee privacy.
	 */
	$effect(() => {
		const decrypt = async () => {
			loading = true;
			const key = get(encryptionKey);
			if (key && data.student) {
				try {
					const decrypted = await decryptData(data.student.encrypted_data, key);
					const decryptedData = decrypted as Omit<Student, 'id'>;

					let journalEntries = decryptedData.journalEntries || [];

					if (data.guestNotes && data.guestNotes.length > 0) {
						const sessionKeys = new SvelteMap<string, CryptoKey>();

						for (const note of data.guestNotes) {
							try {
								const session = note.shared_sessions;
								if (!session?.owner_recovery_token) continue;

								let shareKey = sessionKeys.get(session.owner_recovery_token);
								if (!shareKey) {
									// 1. Decrypt the recovery token with Master Key
									const recovered = (await decryptData(session.owner_recovery_token, key)) as {
										key: string;
									};
									if (recovered?.key) {
										const rawKey = base64ToUint8Array(recovered.key);
										shareKey = await importRawKey(rawKey);
										sessionKeys.set(session.owner_recovery_token, shareKey);
									}
								}

								if (shareKey) {
									// 2. Decrypt the note content with Share Key
									const content = (await decryptData(note.encrypted_content, shareKey)) as string;

									if (!journalEntries.some((e) => e.id === note.id)) {
										journalEntries.push({
											id: note.id,
											content,
											date: note.created_at,
											updatedAt: note.created_at
										});
									}
								}
							} catch (e) {
								console.error('Failed to recover guest note', e);
							}
						}
					}

					// Deduplicate entire array to fix any previously saved duplicates
					const uniqueEntries = new SvelteMap<string, JournalEntry>();
					journalEntries.forEach((e) => uniqueEntries.set(e.id, e));
					journalEntries = Array.from(uniqueEntries.values());

					student = {
						id: data.student.id,
						...decryptedData,
						generalInfo: decryptedData.generalInfo || '',
						journalEntries: journalEntries
					};
				} catch (e) {
					console.error('Decryption failed', e);
				}
			}
			loading = false;
		};
		decrypt();
	});

	async function saveStudent() {
		if (!student) return;
		saving = true;
		const key = get(encryptionKey);

		if (!key) {
			notifications.send('Clé de chiffrement manquante', 'error');
			saving = false;
			return;
		}

		try {
			const { id, ...dataToEncrypt } = student;
			const encrypted = await encryptData(dataToEncrypt, key);

			const { error } = await supabase
				.from('students')
				.update({ encrypted_data: encrypted })
				.eq('id', id);

			if (error) throw error;

			notifications.send('Modifications sauvegardées avec succès !', 'success');
		} catch (e) {
			console.error(e);
			notifications.send('Erreur lors de la sauvegarde', 'error');
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>{student ? `${student.firstName} ${student.lastName}` : 'Élève'} - Ma Trousse</title>
</svelte:head>

<div class="mx-auto max-w-6xl pb-12">
	{#if loading}
		<div class="flex flex-col items-center justify-center py-20">
			<div class="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
			<p class="font-hand animate-pulse text-2xl text-gray-400">Ouverture du dossier...</p>
		</div>
	{:else if student}
		<StudentDetailBoard bind:student onSave={saveStudent} {saving} />
	{:else}
		<div class="py-20 text-center">
			<h2 class="font-hand text-3xl text-gray-400">Élève non trouvé.</h2>
			<a
				href="/app/ma-classe"
				class="font-hand mt-4 inline-block text-xl text-indigo-500 hover:underline"
				>Retourner à la liste</a
			>
		</div>
	{/if}
</div>
