<script lang="ts">
	import PostIt from '$lib/components/ui/PostIt.svelte';
	import PostItView from '$lib/components/ma-classe/PostItView.svelte';
	import Doodle from '$lib/components/ui/Doodle.svelte';
	import type { TransitionConfig } from 'svelte/transition';

	interface Props {
		isActive: boolean;
		onOpen: () => void;
		onClose: () => void;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		send: (node: Element, params: any) => TransitionConfig | (() => TransitionConfig);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		receive: (node: Element, params: any) => TransitionConfig | (() => TransitionConfig);
	}

	let { isActive, onOpen, onClose, send, receive }: Props = $props();
</script>

{#if isActive}
	<div
		class="fixed inset-0 z-50 h-full w-full overflow-y-auto sm:absolute sm:inset-0 sm:z-20 sm:overflow-visible"
	>
		<PostItView title="Suivi Pédagogique" variant="yellow" {onClose} id="pedagogy" {send} {receive}>
			<div
				class="flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-yellow-400/50 bg-white/30"
			>
				<p class="font-hand text-2xl text-gray-500">Notes et résultats à venir...</p>
			</div>
		</PostItView>
	</div>
{:else}
	<div class="relative z-10 w-full sm:absolute sm:bottom-20 sm:left-32 sm:w-80">
		<PostIt
			variant="yellow"
			rotate={0}
			class="h-60 cursor-pointer shadow-md transition-all hover:scale-105 hover:shadow-xl sm:rotate-2 sm:hover:rotate-0"
			onclick={onOpen}
			id="pedagogy"
			{send}
			{receive}
		>
			<div class="flex h-full flex-col items-center justify-center text-center">
				<Doodle type="flower" class="mb-4 h-14 w-14 text-yellow-600" />
				<h3 class="font-hand text-3xl font-bold text-yellow-900">Pédagogie</h3>
				<p class="font-hand mt-2 text-lg text-yellow-800">Suivi & Notes</p>
			</div>
		</PostIt>
	</div>
{/if}
