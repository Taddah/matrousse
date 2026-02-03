<script lang="ts">
	import PaperModal from '$lib/components/ui/PaperModal.svelte';
	import StickerButton from '$lib/components/ui/StickerButton.svelte';
	import type { Student } from '$lib/types';
	import {
		parseCsvContent,
		autoGuessMapping,
		convertRowsToStudents
	} from '$lib/services/csvImportService';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		onImport: (students: Omit<Student, 'id'>[]) => void;
	}

	let { isOpen, onClose, onImport }: Props = $props();

	let step: 'UPLOAD' | 'MAPPING' | 'IMPORTING' = $state('UPLOAD');
	let file: File | null = $state(null);
	let rawHeaders: string[] = $state([]);
	let previewRows: string[][] = $state([]);
	let csvContent: string[][] = $state([]);
	let errorMessage: string | null = $state(null);
	let encoding: 'ISO-8859-1' | 'UTF-8' = $state('ISO-8859-1');

	let mapping: Record<string, string> = $state({
		lastName: '',
		firstName: '',
		birthDate: '',
		contactLastName: '',
		contactFirstName: '',
		contactEmail: '',
		contactPhone: '',
		gender: '',
		grade: ''
	});

	const targetFields = [
		{ key: 'lastName', label: 'Nom' },
		{ key: 'firstName', label: 'Prénom' },
		{ key: 'birthDate', label: 'Date de naissance' },
		{ key: 'gender', label: 'Sexe (M/F)' },
		{ key: 'grade', label: 'Niveau (CP, CE1...)' }
	];

	const contactFields = [
		{ key: 'contactLastName', label: 'Nom du responsable' },
		{ key: 'contactFirstName', label: 'Prénom du responsable' },
		{ key: 'contactPhone', label: 'Téléphone' },
		{ key: 'contactEmail', label: 'Email' }
	];

	function reset() {
		step = 'UPLOAD';
		file = null;
		rawHeaders = [];
		previewRows = [];
		csvContent = [];
		errorMessage = null;
		mapping = {
			lastName: '',
			firstName: '',
			birthDate: '',
			contactLastName: '',
			contactFirstName: '',
			contactEmail: '',
			contactPhone: '',
			gender: '',
			grade: ''
		};
	}

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			file = target.files[0];
			errorMessage = null;
		}
	}

	async function processFile() {
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target?.result as string;
			try {
				const result = parseCsvContent(text);
				rawHeaders = result.headers;
				csvContent = result.content;
				previewRows = csvContent.slice(0, 3);
				mapping = autoGuessMapping(rawHeaders);
				step = 'MAPPING';
			} catch (err) {
				errorMessage = (err as Error).message;
			}
		};

		reader.onerror = () => {
			errorMessage = 'Erreur lors de la lecture du fichier.';
		};

		reader.readAsText(file, encoding);
	}

	function handleImport() {
		if (!mapping.lastName || !mapping.firstName) {
			errorMessage = 'Veuillez associer au moins le Nom et le Prénom.';
			return;
		}

		const newStudents = convertRowsToStudents(csvContent, mapping);

		if (newStudents.length === 0) {
			errorMessage = 'Aucun élève valide trouvé.';
			return;
		}

		onImport(newStudents);
		handleClose();
	}

	function handleClose() {
		reset();
		onClose();
	}
</script>

<PaperModal {isOpen} onClose={handleClose} title="Importer une classe" variant="blue">
	<div class="flex flex-col gap-6">
		{#if step === 'UPLOAD'}
			<div class="font-hand text-center text-xl text-gray-700">
				<p class="mb-4">
					Choisissez un fichier CSV (export ONDE ou autre).<br />
					Le fichier et ses informations ne seront traités que dans votre navigateur
				</p>

				<div
					class="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 p-8 transition-colors hover:border-indigo-400 hover:bg-indigo-100"
				>
					<input
						type="file"
						accept=".csv"
						onchange={handleFileChange}
						class="hidden"
						id="csv-upload"
					/>
					<label for="csv-upload" class="cursor-pointer">
						<div class="flex flex-col items-center gap-2">
							<span class="text-4xl">📂</span>
							<span class="font-bold text-indigo-700 decoration-2 hover:underline">
								{file ? file.name : 'Cliquez pour sélectionner un fichier'}
							</span>
						</div>
					</label>
					{#if file}
						<p class="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
					{/if}
				</div>

				{#if errorMessage}
					<p class="mt-4 font-bold text-red-500">{errorMessage}</p>
				{/if}

				<div class="mt-4 flex flex-col items-center">
					<p class="mb-2 text-sm text-gray-600">Encodage des caractères :</p>
					<div class="flex gap-4">
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="radio"
								name="encoding"
								value="ISO-8859-1"
								bind:group={encoding}
								class="text-indigo-600 focus:ring-indigo-500"
							/>
							<span class="text-gray-700">Windows-1252 / ANSI (ONDE)</span>
						</label>
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="radio"
								name="encoding"
								value="UTF-8"
								bind:group={encoding}
								class="text-indigo-600 focus:ring-indigo-500"
							/>
							<span class="text-gray-700">UTF-8 (Standard)</span>
						</label>
					</div>
				</div>

				<div class="mt-6 flex justify-end">
					<StickerButton variant="green" disabled={!file} onclick={processFile}>
						Suivant ➜
					</StickerButton>
				</div>
			</div>
		{:else if step === 'MAPPING'}
			<div class="font-hand max-h-[70vh] overflow-y-auto px-1">
				<p class="mb-4 text-lg text-gray-600">Associez les colonnes de votre fichier :</p>
				<p class="mb-4 text-sm text-gray-600">
					En cas d'erreur d'encodage sur les accents, revenez en arrière et choississez un autre
					encodage.
				</p>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="col-span-full mb-2 border-b border-gray-200 pb-2">
						<h3 class="text-lg font-bold text-indigo-900">🎓 L'élève</h3>
					</div>
					{#each targetFields as field}
						<div class="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
							<label for="map-{field.key}" class="mb-1 block font-bold text-gray-700"
								>{field.label}</label
							>
							<select
								id="map-{field.key}"
								bind:value={mapping[field.key]}
								class="w-full rounded border-gray-300 text-lg focus:border-indigo-500 focus:ring-indigo-500"
							>
								<option value="">-- Ignorer --</option>
								{#each rawHeaders as header, i}
									<option value={i.toString()}>{header} (Col {i + 1})</option>
								{/each}
							</select>
						</div>
					{/each}

					<div class="col-span-full mb-2 mt-4 border-b border-gray-200 pb-2">
						<h3 class="text-lg font-bold text-indigo-900">🏠 Responsable Légal (Optionnel)</h3>
					</div>
					{#each contactFields as field}
						<div class="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
							<label for="map-{field.key}" class="mb-1 block font-bold text-gray-700"
								>{field.label}</label
							>
							<select
								id="map-{field.key}"
								bind:value={mapping[field.key]}
								class="w-full rounded border-gray-300 text-lg focus:border-indigo-500 focus:ring-indigo-500"
							>
								<option value="">-- Ignorer --</option>
								{#each rawHeaders as header, i}
									<option value={i.toString()}>{header} (Col {i + 1})</option>
								{/each}
							</select>
						</div>
					{/each}
				</div>

				<div class="mt-6">
					<p class="mb-2 font-bold text-gray-700">Aperçu des 3 premiers élèves :</p>
					<div class="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-2 text-sm">
						<table class="w-full text-left">
							<thead>
								<tr class="border-b border-gray-200 text-gray-500">
									<th class="p-2">Nom</th>
									<th class="p-2">Prénom</th>
									<th class="p-2">Date Naissance</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-200">
								{#each previewRows as row}
									<tr>
										<td class="p-2 font-bold text-indigo-900">
											{mapping.lastName ? row[parseInt(mapping.lastName)] : '-'}
										</td>
										<td class="p-2 text-gray-800">
											{mapping.firstName ? row[parseInt(mapping.firstName)] : '-'}
										</td>
										<td class="p-2 text-gray-600">
											{mapping.birthDate ? row[parseInt(mapping.birthDate)] : '-'}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>

				{#if errorMessage}
					<p class="mt-4 text-center font-bold text-red-500">{errorMessage}</p>
				{/if}

				<div class="mt-6 flex justify-between">
					<button
						onclick={() => (step = 'UPLOAD')}
						class="text-gray-500 underline hover:text-gray-700"
					>
						Retour
					</button>
					<StickerButton variant="indigo" onclick={handleImport}>Importer la classe</StickerButton>
				</div>
			</div>
		{/if}
	</div>
</PaperModal>
