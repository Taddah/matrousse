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
		<PostItView title="Famille & Contacts" variant="green" {onClose} id="family" {send} {receive}>
			<div class="grid grid-cols-1 gap-8">
				<div class="rounded-lg border border-green-200 bg-white/40 p-6 shadow-sm">
					<h3 class="font-hand mb-4 text-xl font-bold text-green-800">
						Contacts Parents / Responsables
					</h3>
					<textarea
						class="font-hand h-40 w-full resize-none border-none bg-transparent text-xl leading-relaxed text-gray-700 placeholder-green-300 focus:ring-0"
						placeholder="Noms, téléphones, emails..."
						style="background-image: linear-gradient(transparent, transparent 31px, #bbf7d0 31px, #bbf7d0 32px); background-size: 100% 32px; line-height: 32px;"
					></textarea>
				</div>
				<div class="rounded-lg border border-yellow-200 bg-yellow-50/50 p-6 shadow-sm">
					<h3 class="font-hand mb-4 text-xl font-bold text-yellow-800">
						Historique Liaison (Visas)
					</h3>
					<div class="font-hand pb-2 italic text-gray-500">Dernier mot signé le...</div>
				</div>
			</div>
		</PostItView>
	</div>
{:else}
	<div class="absolute right-20 top-20 z-10 w-72">
		<PostIt
			variant="green"
			rotate={4}
			class="h-64 cursor-pointer shadow-md transition-all hover:rotate-0 hover:scale-105 hover:shadow-xl"
			onclick={onOpen}
			id="family"
			{send}
			{receive}
		>
			<div class="flex h-full flex-col items-center justify-center text-center">
				<Doodle type="star" class="mb-4 h-16 w-16 text-green-500" />
				<h3 class="font-hand text-3xl font-bold text-green-900">Famille</h3>
				<p class="font-hand mt-2 text-lg text-green-700">Contacts & Mots</p>
			</div>
		</PostIt>
	</div>
{/if}
