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
	<div class="absolute inset-0 z-20">
		<PostItView title="Journal de Bord" variant="purple" {onClose} id="journal" {send} {receive}>
			<div class="relative space-y-8 border-l-2 border-purple-300 pl-8">
				<div class="relative">
					<div
						class="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-2 border-white bg-purple-500 shadow"
					></div>
					<div class="font-hand mb-1 text-sm text-gray-500">Aujourd'hui</div>
					<div class="rounded-lg border border-purple-200 bg-white/60 p-4 shadow-sm">
						<p class="font-hand text-xl text-gray-700">Rien à signaler pour le moment.</p>
					</div>
				</div>
			</div>
		</PostItView>
	</div>
{:else}
	<div class="absolute bottom-10 right-40 z-10 w-72">
		<PostIt
			variant="purple"
			rotate={-5}
			class="h-64 cursor-pointer shadow-md transition-all hover:rotate-0 hover:scale-105 hover:shadow-xl"
			onclick={onOpen}
			id="journal"
			{send}
			{receive}
		>
			<div class="flex h-full flex-col items-center justify-center text-center">
				<Doodle type="underline" class="mb-4 h-8 w-24 text-purple-400" />
				<h3 class="font-hand text-3xl font-bold text-purple-900">Journal</h3>
				<p class="font-hand mt-2 text-lg text-purple-700">Observations</p>
			</div>
		</PostIt>
	</div>
{/if}
