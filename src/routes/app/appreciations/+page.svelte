<script lang="ts">
	import { get } from 'svelte/store';
	import { encryptionKey, decryptData } from '$lib/crypto';
	import type { Student } from '$lib/types';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import HandwrittenSelect from '$lib/components/ui/HandwrittenSelect.svelte';
	import TagInput from '$lib/components/ui/TagInput.svelte';
	import StickerButton from '$lib/components/ui/StickerButton.svelte';
	import PostIt from '$lib/components/ui/PostIt.svelte';
	import InfoPopup from '$lib/components/ui/InfoPopup.svelte';
	import { notifications } from '$lib/stores/notifications';

	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let selectedStudentId = $state('');
	let strengths = $state<string[]>([]);
	let improvements = $state<string[]>([]);
	let mood = $state('Bienveillant');
	let notes = $state('');
	let maxLength = $state(50);
	let loading = $state(false);
	let gender = $state('M');
	let generatedStudentName = $state('');

	let decryptedStudents: Student[] = $state([]);

	let studentOptions = $derived.by(() => {
		const groups: Record<string, any[]> = {};
		decryptedStudents.forEach((s) => {
			if (!groups[s.grade]) groups[s.grade] = [];
			groups[s.grade].push({ value: s.id, label: `${s.firstName} ${s.lastName}` });
		});
		return Object.entries(groups).map(([label, options]) => ({ label, options }));
	});

	let selectedStudent = $derived(decryptedStudents.find((s) => s.id === selectedStudentId));

	$effect(() => {
		const key = get(encryptionKey);
		if (key && data.students) {
			decryptStudentsList(data.students, key);
		}
	});

	async function decryptStudentsList(encryptedList: any[], key: CryptoKey) {
		const list: Student[] = [];
		for (const row of encryptedList) {
			try {
				const info = (await decryptData(row.encrypted_data, key)) as Omit<Student, 'id'>;
				list.push({
					id: row.id,
					...info
				});
			} catch {
				console.error('Failed to decrypt row', row.id);
				notifications.send('Erreur lors du déchiffrement de certains élèves.', 'error');
			}
		}
		decryptedStudents = list;
	}

	import { strengthSuggestions, improvementSuggestions } from '$lib/constants';

	const moodOptions = [
		{ value: 'Bienveillant', label: '😊 Bienveillant (Standard)' },
		{ value: 'Encourageant', label: '🌟 Encourageant' },
		{ value: 'Factuel', label: '📊 Factuel' },
		{ value: 'Avertissement', label: '⚠️ Avertissement' },
		{ value: 'Direct', label: '🎯 Direct' }
	];

	const genderOptions = [
		{ value: 'M', label: 'Garçon' },
		{ value: 'F', label: 'Fille' }
	];

	const submitHandler: SubmitFunction = () => {
		loading = true;
		generatedStudentName = '';
		return async ({ result, update }) => {
			if (result.type === 'success' && result.data?.appreciation) {
				if (selectedStudent) {
					result.data.appreciation = result.data.appreciation.replace(
						/\[PRENOM\]/g,
						selectedStudent.firstName
					);
					generatedStudentName = `${selectedStudent.firstName} ${selectedStudent.lastName}`;
				}
			}
			await update({ reset: false });
			loading = false;
		};
	};

	function copyToClipboard() {
		if (form?.appreciation) {
			navigator.clipboard.writeText(form.appreciation as string);
			notifications.send('Copié !', 'success');
		}
	}
</script>

<div class="mx-auto flex h-full max-w-6xl flex-col gap-8 md:flex-row">
	<div class="flex-1 space-y-4">
		<header>
			<div class="mb-2 flex items-center gap-1">
				<h1 class="font-hand text-4xl font-bold text-indigo-900">Appréc-IA ✨</h1>
				<InfoPopup title="Comment ça marche ?">
					<p class="mb-2">
						Ce service utilise l'intelligence artificielle (Mistral) pour générer des appréciations
						bienveillantes et constructives.
					</p>
					<p class="mb-2">
						<strong>Confidentialité garantie :</strong> Aucune donnée sensible n'est envoyée à l'IA. Les
						noms sont anonymisés avant l'envoi.
					</p>
					<p>
						Vous pouvez sélectionner des mots-clés dans la liste ou <strong
							>ajouter vos propres termes</strong
						> pour plus de précision !
					</p>
				</InfoPopup>
			</div>
			<p class="font-hand text-lg text-stone-600">
				Générez des appréciations personnalisées en un clin d'œil.
			</p>
		</header>

		<form
			method="POST"
			use:enhance={submitHandler}
			class="space-y-5 rounded-2xl border-2 border-indigo-100 bg-white/50 p-5 shadow-sm"
		>
			<input type="hidden" name="studentLevel" value={selectedStudent?.grade || ''} />
			<input type="hidden" name="gender" value={gender} />
			<input type="hidden" name="strengths" value={strengths.join(', ')} />
			<input type="hidden" name="improvements" value={improvements.join(', ')} />

			<div class="space-y-4">
				<div class="flex flex-col items-start gap-4 md:flex-row">
					<div class="w-full flex-1">
						<label for="student" class="font-hand ml-1 block text-lg text-gray-600">Élève</label>
						<HandwrittenSelect
							id="student"
							options={studentOptions}
							bind:value={selectedStudentId}
						/>
					</div>
					<div class="w-full md:w-32">
						<label for="gender" class="font-hand ml-1 block text-lg text-gray-600">Genre</label>
						<HandwrittenSelect id="gender" options={genderOptions} bind:value={gender} />
					</div>
				</div>

				<TagInput
					id="strengths"
					label="Points forts"
					placeholder="Ajouter un point fort..."
					bind:tags={strengths}
					suggestions={strengthSuggestions}
				/>

				<TagInput
					id="improvements"
					label="Axes d'effort"
					placeholder="Ajouter un axe d'effort..."
					bind:tags={improvements}
					suggestions={improvementSuggestions}
				/>

				<div class="flex flex-col items-start gap-4 md:flex-row">
					<div class="w-full flex-1">
						<label for="mood" class="font-hand ml-1 block text-lg text-gray-600">Ton</label>
						<HandwrittenSelect id="mood" options={moodOptions} bind:value={mood} />
					</div>
					<div class="w-full md:w-40">
						<label for="maxLength" class="font-hand ml-1 block truncate text-lg text-gray-600"
							>Longueur max</label
						>
						<input
							type="number"
							name="maxLength"
							id="maxLength"
							bind:value={maxLength}
							class="font-hand w-full rounded-full border border-stone-300 bg-stone-50 px-4 py-1 text-lg shadow-sm focus:ring-indigo-200"
						/>
					</div>
				</div>

				<div>
					<label for="notes" class="font-hand ml-1 block text-lg text-gray-600"
						>Notes brutes (optionnel)</label
					>
					<textarea
						name="notes"
						id="notes"
						bind:value={notes}
						rows="3"
						class="font-hand w-full resize-none rounded-xl border border-stone-300 bg-stone-50 p-3 text-lg shadow-sm focus:ring-indigo-200"
						placeholder="Ex: A fait beaucoup de progrès en géométrie..."
					></textarea>
				</div>
			</div>

			<div
				class="sticky bottom-0 -mx-6 rounded-b-2xl border-t border-indigo-50 bg-white/40 px-6 pb-6 pt-4 backdrop-blur-sm"
			>
				<StickerButton
					type="submit"
					variant="green"
					disabled={!selectedStudentId || loading}
					class="w-full justify-center px-8 text-xl shadow-lg md:w-auto"
				>
					{loading ? 'Génération en cours...' : "Générer l'appréciation ✨"}
				</StickerButton>
			</div>

			{#if form?.error}
				<p class="font-hand text-center text-red-500">{form.error}</p>
			{/if}
		</form>
	</div>

	<div class="flex flex-1 flex-col items-center justify-center py-12 md:py-0">
		{#if form?.appreciation || loading}
			<div class="relative w-full max-w-md rotate-1 transform transition-all">
				<PostIt variant="yellow" fullWidth={true} minHeight="300px">
					<div class="flex h-full flex-col items-center p-4">
						<h3
							class="font-hand mb-4 w-full border-b-2 border-yellow-600/20 pb-2 text-center text-2xl font-bold"
						>
							{generatedStudentName
								? generatedStudentName
								: selectedStudent
									? `${selectedStudent.firstName} ${selectedStudent.lastName}`
									: 'Résultat'}
						</h3>

						{#if loading}
							<div class="flex flex-1 items-center justify-center">
								<div class="animate-bounce text-4xl">✏️</div>
							</div>
						{:else if form?.appreciation}
							<p
								class="font-hand text-ink w-full flex-1 whitespace-pre-wrap text-left text-xl leading-loose"
							>
								{form.appreciation}
							</p>

							<div class="mt-6 flex w-full justify-end">
								<button
									onclick={copyToClipboard}
									class="font-hand flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-stone-800"
								>
									<span>📋</span> Copier
								</button>
							</div>
						{/if}
					</div>
				</PostIt>
			</div>
		{:else}
			<div
				class="flex h-full select-none flex-col items-center justify-center text-stone-400 opacity-50"
			>
				<span class="mb-4 text-6xl">👈</span>
				<p class="font-hand text-center text-2xl">Remplissez le formulaire<br />pour commencer</p>
			</div>
		{/if}
	</div>
</div>
