<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { encryptionKey, decryptData, encryptData } from '$lib/crypto';
	import { fade, fly } from 'svelte/transition';
	import type { Student } from '$lib/types';
	import { page } from '$app/stores';

	let { data } = $props();

	let student: Student | null = $state(null);
	let loading = $state(true);
	let activeTab: 'profile' | 'family' | 'pedagogy' | 'journal' = $state('profile');
	let direction = $state(1); // 1 for next, -1 for prev

	// Tabs definition with colors
	const tabs = [
		{
			id: 'profile',
			label: 'Profil & Santé',
			color: 'bg-blue-100',
			border: 'border-blue-300',
			text: 'text-blue-800'
		},
		{
			id: 'family',
			label: 'Famille',
			color: 'bg-green-100',
			border: 'border-green-300',
			text: 'text-green-800'
		},
		{
			id: 'pedagogy',
			label: 'Pédagogie',
			color: 'bg-yellow-100',
			border: 'border-yellow-300',
			text: 'text-yellow-800'
		},
		{
			id: 'journal',
			label: 'Journal',
			color: 'bg-purple-100',
			border: 'border-purple-300',
			text: 'text-purple-800'
		}
	];

	$effect(() => {
		const decrypt = async () => {
			loading = true;
			const key = get(encryptionKey);
			if (key && data.student) {
				try {
					const decrypted = await decryptData(data.student.encrypted_data, key);
					student = { id: data.student.id, ...(decrypted as Omit<Student, 'id'>) };
				} catch (e) {
					console.error('Decryption failed', e);
				}
			}
			loading = false;
		};
		decrypt();
	});

	function setActiveTab(tabId: typeof activeTab) {
		const currentIndex = tabs.findIndex((t) => t.id === activeTab);
		const newIndex = tabs.findIndex((t) => t.id === tabId);
		direction = newIndex > currentIndex ? 1 : -1;
		activeTab = tabId;
	}
</script>

<svelte:head>
	<title>{student ? `${student.firstName} ${student.lastName}` : 'Élève'} - Ma Trousse</title>
</svelte:head>

<div class="mx-auto max-w-4xl pb-12">
	<div class="mb-6">
		<a
			href="/app/ma-classe"
			class="font-hand flex items-center gap-2 text-xl text-indigo-600 transition-colors hover:text-indigo-800"
		>
			<span>←</span> Retour à la classe
		</a>
	</div>

	{#if loading}
		<div class="flex flex-col items-center justify-center py-20">
			<div class="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
			<p class="font-hand animate-pulse text-2xl text-gray-400">Ouverture du dossier...</p>
		</div>
	{:else if student}
		<!-- Directory Layout -->
		<div class="relative mt-8">
			<!-- Main Content Area (Transparent) -->
			<div class="relative z-20 min-h-[600px] p-4 md:p-8">
				<!-- Content Area with Transition -->
				<div class="h-full">
					{#key activeTab}
						<div
							class="h-full w-full"
							in:fly={{ x: 20, duration: 400, delay: 100, opacity: 0 }}
							out:fly={{ x: -20, duration: 300, opacity: 0 }}
						>
							{#if activeTab === 'profile'}
								<h2
									class="font-hand mb-6 border-b-2 border-blue-200 pb-2 text-3xl font-bold text-blue-800"
								>
									Profil & Santé
								</h2>
								<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
									<!-- Identity Section -->
									<div
										class="rotate-1 rounded-lg border border-blue-100 bg-blue-50/50 p-6 shadow-sm"
									>
										<h3 class="font-hand mb-4 text-xl font-bold text-blue-700">Identité</h3>
										<div class="space-y-4">
											<div>
												<p class="font-hand mb-1 block text-gray-500">Prénom</p>
												<div
													class="font-hand text-ink border-b border-dashed border-blue-300 pb-1 text-2xl"
												>
													{student.firstName}
												</div>
											</div>
											<div>
												<p class="font-hand mb-1 block text-gray-500">Nom</p>
												<div
													class="font-hand text-ink border-b border-dashed border-blue-300 pb-1 text-2xl"
												>
													{student.lastName}
												</div>
											</div>
											<div class="flex gap-4">
												<div class="flex-1">
													<p class="font-hand mb-1 block text-gray-500">Âge</p>
													<div
														class="font-hand text-ink border-b border-dashed border-blue-300 pb-1 text-2xl"
													>
														--
													</div>
												</div>
												<div class="flex-1">
													<div class="font-hand mb-1 block text-gray-500">Niveau</div>
													<div
														class="font-hand text-ink border-b border-dashed border-blue-300 pb-1 text-2xl"
													>
														{student.grade}
													</div>
												</div>
											</div>
										</div>
									</div>

									<!-- Health Section -->
									<div
										class="-rotate-1 rounded-lg border border-red-100 bg-red-50/50 p-6 shadow-sm"
									>
										<h3 class="font-hand mb-4 text-xl font-bold text-red-700">
											Alertes PAI / Santé
										</h3>
										<textarea
											class="font-hand h-32 w-full resize-none border-none bg-transparent text-xl leading-relaxed text-gray-700 placeholder-red-200 focus:ring-0"
											placeholder="Y a-t-il des allergies ou des problèmes médicaux à noter ?"
											style="background-image: linear-gradient(transparent, transparent 31px, #fecaca 31px, #fecaca 32px); background-size: 100% 32px; line-height: 32px;"
										></textarea>
									</div>
								</div>
							{:else if activeTab === 'family'}
								<h2
									class="font-hand mb-6 border-b-2 border-green-200 pb-2 text-3xl font-bold text-green-800"
								>
									Famille & Contacts
								</h2>
								<div class="grid grid-cols-1 gap-8">
									<div class="rounded-lg border border-green-100 bg-green-50/50 p-6 shadow-sm">
										<h3 class="font-hand mb-4 text-xl font-bold text-green-700">
											Contacts Parents / Responsables
										</h3>
										<textarea
											class="font-hand h-40 w-full resize-none border-none bg-transparent text-xl leading-relaxed text-gray-700 placeholder-green-200 focus:ring-0"
											placeholder="Noms, téléphones, emails..."
											style="background-image: linear-gradient(transparent, transparent 31px, #bbf7d0 31px, #bbf7d0 32px); background-size: 100% 32px; line-height: 32px;"
										></textarea>
									</div>
									<div class="rounded-lg border border-yellow-100 bg-yellow-50/50 p-6 shadow-sm">
										<h3 class="font-hand mb-4 text-xl font-bold text-yellow-700">
											Historique Liaison (Visas)
										</h3>
										<div class="font-hand pb-2 italic text-gray-500">Dernier mot signé le...</div>
										<!-- Todo: Checklist component here -->
									</div>
								</div>
							{:else if activeTab === 'pedagogy'}
								<h2
									class="font-hand mb-6 border-b-2 border-yellow-200 pb-2 text-3xl font-bold text-yellow-800"
								>
									Suivi Pédagogique
								</h2>
								<div
									class="flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300"
								>
									<p class="font-hand text-2xl text-gray-400">Notes et résultats à venir...</p>
								</div>
							{:else if activeTab === 'journal'}
								<h2
									class="font-hand mb-6 border-b-2 border-purple-200 pb-2 text-3xl font-bold text-purple-800"
								>
									Journal de Bord
								</h2>
								<div class="relative space-y-8 border-l-2 border-purple-200 pl-8">
									<!-- Timeline Item Example -->
									<div class="relative">
										<div
											class="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-2 border-white bg-purple-400 shadow"
										></div>
										<div class="font-hand mb-1 text-sm text-gray-500">Aujourd'hui</div>
										<div class="rounded-lg border border-gray-100 bg-white p-4 shadow">
											<p class="font-hand text-xl text-gray-700">Rien à signaler pour le moment.</p>
										</div>
									</div>
								</div>
							{/if}
						</div>
					{/key}
				</div>
			</div>

			<!-- Vertical Tabs (Fixed Right Screen Edge) -->
			<div class="fixed right-0 top-32 z-50 flex flex-col gap-3" style="width: 50px;">
				{#each tabs as tab}
					<button
						onclick={() => setActiveTab(tab.id as any)}
						class="
							font-hand relative flex h-24 w-full items-center justify-center rounded-l-xl border-y border-l border-gray-300 shadow-md transition-all duration-300
							{activeTab === tab.id
							? `z-30 w-[60px] -translate-x-[10px] ${tab.color} ${tab.border} ${tab.text} shadow-lg ring-1 ring-white/50`
							: 'z-10 bg-white text-gray-400 hover:w-[55px] hover:-translate-x-[5px] hover:bg-gray-50'}
						"
					>
						<!-- Vertical Text -->
						<span class="text-md -rotate-180 font-bold tracking-widest [writing-mode:vertical-rl]"
							>{tab.label.split(' ')[0]}</span
						>
					</button>
				{/each}
			</div>
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

<style>
	/* No specific styles needed for this layout as we use Tailwind classes */
</style>
