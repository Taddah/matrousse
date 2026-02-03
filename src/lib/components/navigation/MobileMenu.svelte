<script lang="ts">
	import { page } from '$app/state';
	import { supabase } from '$lib/supabase';
	import { navigationLinks } from '$lib/config/navigation';
</script>

<nav
	class="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-indigo-900/10 bg-white p-2 shadow-2xl backdrop-blur-md"
>
	{#each navigationLinks as link}
		{@const isActive =
			link.href === '/app'
				? page.url.pathname === link.href
				: page.url.pathname.startsWith(link.href)}
		<a
			href={link.href}
			class="flex flex-col items-center rounded-lg p-2 transition-colors
            {isActive
				? `${link.mobileColor.bg} ${link.mobileColor.text}`
				: 'text-gray-500 hover:bg-gray-100'}"
		>
			<span class="text-2xl">{link.icon}</span>
			<span class="font-hand text-xs font-bold">{link.label}</span>
		</a>
	{/each}

	<button
		onclick={() => supabase.auth.signOut()}
		class="flex flex-col items-center rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
	>
		<span class="text-2xl">🚪</span>
		<span class="font-hand text-xs font-bold">Sortir</span>
	</button>
</nav>
