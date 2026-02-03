<script lang="ts">
	import { send, receive } from '$lib/utils/animations';
	import type { Student } from '$lib/types';
	import Doodle from '$lib/components/ui/Doodle.svelte';
	import ProfilePostIt from '$lib/components/ma-classe/post-its/ProfilePostIt.svelte';
	import FamilyPostIt from '$lib/components/ma-classe/post-its/FamilyPostIt.svelte';
	import PedagogyPostIt from '$lib/components/ma-classe/post-its/PedagogyPostIt.svelte';
	import JournalPostIt from '$lib/components/ma-classe/post-its/JournalPostIt.svelte';

	interface Props {
		student: Student;
		isReadOnly?: boolean;
		onSave?: () => Promise<void>;
		saving?: boolean;
		recipientName?: string;
	}

	let {
		student = $bindable(),
		isReadOnly = false,
		onSave = async () => {},
		saving = false,
		recipientName = ''
	}: Props = $props();

	let activeSection: 'profile' | 'family' | 'pedagogy' | 'journal' | null = $state(null);

	function closeSection() {
		activeSection = null;
	}
</script>

<div class="relative w-full p-4 sm:h-[650px] sm:h-auto">
	<div
		class="relative mb-6 transform text-center opacity-80 sm:absolute sm:left-1/2 sm:top-4 sm:mb-0 sm:-translate-x-1/2"
		class:hidden={activeSection !== null}
		class:sm:block={activeSection !== null}
	>
		<h1 class="font-hand rotate-2 text-4xl font-bold text-gray-400/50 sm:text-6xl">Ma Classe</h1>
		<div class="font-hand -mt-2 -rotate-1 text-lg text-gray-400/40 sm:text-2xl">Dossier Élève</div>
	</div>

	<div class="flex flex-col gap-4 sm:block">
		<ProfilePostIt
			bind:student
			isActive={activeSection === 'profile'}
			onOpen={() => (activeSection = 'profile')}
			onClose={closeSection}
			{onSave}
			{saving}
			{send}
			{receive}
			{isReadOnly}
		/>

		{#if activeSection !== 'profile'}
			<FamilyPostIt
				isActive={activeSection === 'family'}
				onOpen={() => (activeSection = 'family')}
				onClose={closeSection}
				bind:student
				{onSave}
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
				bind:student
				{onSave}
				{send}
				{receive}
				{recipientName}
				{isReadOnly}
			/>
		{/if}
	</div>

	{#if !activeSection}
		<Doodle
			type="spiral"
			class="absolute left-1/2 top-1/2 hidden h-40 w-40 -translate-x-1/2 -translate-y-1/2 text-gray-400 opacity-5 sm:block"
		/>
	{/if}
</div>
