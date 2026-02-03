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

	{#if !activeSection}
		<Doodle
			type="spiral"
			class="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 text-gray-400 opacity-5"
		/>
	{/if}
</div>
