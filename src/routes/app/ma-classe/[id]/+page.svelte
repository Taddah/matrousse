<script lang="ts">
	import { get } from 'svelte/store';
	import { encryptionKey, decryptData, encryptData } from '$lib/crypto';
	import { supabase } from '$lib/supabase';
	import { notifications } from '$lib/stores/notifications';
	import { crossfade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { Student } from '$lib/types';
	import Doodle from '$lib/components/ui/Doodle.svelte';
	import ProfilePostIt from '$lib/components/ma-classe/post-its/ProfilePostIt.svelte';
	import FamilyPostIt from '$lib/components/ma-classe/post-its/FamilyPostIt.svelte';
	import PedagogyPostIt from '$lib/components/ma-classe/post-its/PedagogyPostIt.svelte';
	import JournalPostIt from '$lib/components/ma-classe/post-its/JournalPostIt.svelte';

	let { data } = $props();

	let student: Student | null = $state(null);
	let loading = $state(true);
	let activeSection: 'profile' | 'family' | 'pedagogy' | 'journal' | null = $state(null);
	let saving = $state(false);

	const [send, receive] = crossfade({
		duration: (d) => Math.sqrt(d * 200),
		fallback(node) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			};
		}
	});

	$effect(() => {
		const decrypt = async () => {
			loading = true;
			const key = get(encryptionKey);
			if (key && data.student) {
				try {
					const decrypted = await decryptData(data.student.encrypted_data, key);
					const decryptedData = decrypted as Omit<Student, 'id'>;
					student = {
						id: data.student.id,
						...decryptedData,
						generalInfo: decryptedData.generalInfo || ''
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

	function closeSection() {
		activeSection = null;
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
		<div class="relative h-[650px] w-full p-4">
			<div class="absolute left-1/2 top-4 -translate-x-1/2 transform text-center opacity-80">
				<h1 class="font-hand rotate-2 text-6xl font-bold text-gray-400/50">Ma Classe</h1>
				<div class="font-hand -mt-2 -rotate-1 text-2xl text-gray-400/40">Dossier Élève</div>
			</div>

			<ProfilePostIt
				bind:student
				isActive={activeSection === 'profile'}
				onOpen={() => (activeSection = 'profile')}
				onClose={closeSection}
				onSave={saveStudent}
				{saving}
				{send}
				{receive}
			/>

			{#if activeSection !== 'profile'}
				<FamilyPostIt
					isActive={activeSection === 'family'}
					onOpen={() => (activeSection = 'family')}
					onClose={closeSection}
					{send}
					{receive}
				/>
			{/if}

			{#if activeSection !== 'profile' && activeSection !== 'family'}
				<PedagogyPostIt
					isActive={activeSection === 'pedagogy'}
					onOpen={() => (activeSection = 'pedagogy')}
					onClose={closeSection}
					{send}
					{receive}
				/>
			{/if}

			{#if activeSection !== 'profile' && activeSection !== 'family' && activeSection !== 'pedagogy'}
				<JournalPostIt
					isActive={activeSection === 'journal'}
					onOpen={() => (activeSection = 'journal')}
					onClose={closeSection}
					{send}
					{receive}
				/>
			{/if}

			{#if !activeSection}
				<Doodle
					type="spiral"
					class="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 text-gray-400 opacity-5"
				/>
			{/if}
		</div>
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
