<script lang="ts">
	import StickerButton from '$lib/components/ui/StickerButton.svelte';
	import { notifications } from '$lib/stores/notifications';
	import { sendEmails } from '$lib/services/emailService';

	interface Recipient {
		email: string;
		name: string;
		data?: Record<string, string>;
	}

	let {
		recipients = [],
		defaultSubject = '',
		defaultBody = '',
		onSend
	} = $props<{
		recipients: Recipient[];
		defaultSubject?: string;
		defaultBody?: string;
		onSend?: (count: number) => void;
	}>();

	let subject = $derived(defaultSubject);
	let body = $derived(defaultBody);
	let selectedRecipients = $derived<Set<string>>(
		new Set(recipients.map((r: Recipient) => r.email))
	);

	// Update state if props change
	$effect(() => {
		if (defaultSubject) subject = defaultSubject;
		if (defaultBody) body = defaultBody;

		// If recipients list changes, we re-select all of them by default
		// This handles the case where the user generates sharing links and the list updates.
		if (recipients) {
			selectedRecipients = new Set(recipients.map((r: Recipient) => r.email));
		}
	});

	let sending = $state(false);

	function toggleRecipient(email: string) {
		if (selectedRecipients.has(email)) {
			selectedRecipients.delete(email);
		} else {
			selectedRecipients.add(email);
		}
		selectedRecipients = new Set(selectedRecipients); // Trigger reactivity
	}

	async function handleSend() {
		sending = true;
		const targets = recipients.filter((r: Recipient) => selectedRecipients.has(r.email));

		try {
			const count = await sendEmails(targets, { subject, body });
			notifications.send(`${count} emails envoyés (Simulation) !`, 'success');
			if (onSend) onSend(count);
		} catch (e) {
			console.error(e);
			notifications.send("Erreur lors de l'envoi", 'error');
		} finally {
			sending = false;
		}
	}
</script>

<div class="space-y-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
	<!-- Editor -->
	<div class="space-y-2">
		<input
			type="text"
			bind:value={subject}
			placeholder="Objet de l'email"
			class="w-full rounded border p-2 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
		/>
		<textarea
			bind:value={body}
			rows="6"
			placeholder="Bonjour {{ name }}..."
			class="w-full rounded border p-2 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-200"
		></textarea>
		<p class="text-xs text-gray-500">
			Variables disponibles : <code>{'{{studentFirstName}}'}</code>,
			<code>{'{{studentLastName}}'}</code>, <code>{'{{contactFirstName}}'}</code>,
			<code>{'{{contactLastName}}'}</code>, <code>{'{{link}}'}</code>
		</p>
	</div>

	<!-- Recipients -->
	<div class="border-t pt-2">
		<h4 class="mb-2 text-sm font-bold text-gray-700">
			Destinataires ({selectedRecipients.size})
		</h4>
		<div class="max-h-40 space-y-1 overflow-y-auto">
			{#each recipients as recipient}
				<label class="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-50">
					<input
						type="checkbox"
						checked={selectedRecipients.has(recipient.email)}
						onchange={() => toggleRecipient(recipient.email)}
						class="rounded text-indigo-600 focus:ring-indigo-500"
					/>
					<span class="flex-1 truncate">
						<span class="font-medium">{recipient.name}</span>
						<span class="text-gray-400">&lt;{recipient.email}&gt;</span>
					</span>
				</label>
			{/each}
		</div>
	</div>

	<div class="flex justify-end pt-2">
		<StickerButton
			variant="indigo"
			disabled={sending || selectedRecipients.size === 0}
			onclick={handleSend}
		>
			{sending ? 'Envoi...' : 'Envoyer les emails'}
		</StickerButton>
	</div>
</div>
