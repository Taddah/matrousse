<script lang="ts">
	import { get } from 'svelte/store';
	import { encryptionKey, encryptData } from '$lib/crypto';
	import { supabase } from '$lib/supabase';
	import { notifications } from '$lib/stores/notifications';
	import StudentDetailBoard from '$lib/components/ma-classe/StudentDetailBoard.svelte';
	import type { Student } from '$lib/types';
	import { loadStudentData } from '$lib/services/studentContext';

	let { data } = $props();

	let student: Student | null = $state(null);
	let loading = $state(true);
	let saving = $state(false);

	/**
	 * Main effect: Decrypts student data and loads guest notes.
	 * Uses Zero-Knowledge principle (local key derivation) to guarantee privacy.
	 */
	$effect(() => {
		const init = async () => {
			loading = true;
			const key = get(encryptionKey);
			if (key && data.student) {
				student = await loadStudentData(data.student, data.guestNotes, key);
			}
			loading = false;
		};
		init();
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
		<StudentDetailBoard
			bind:student
			onSave={saveStudent}
			{saving}
			gradingSystem={data.gradingSystem}
		/>
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
