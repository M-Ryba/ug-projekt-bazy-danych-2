<script>
	import '../app.css';
	import './navbar.css';
	import { setLocale, getLocale } from '$lib/paraglide/runtime';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { m } from '$lib/paraglide/messages';
	import { signOut } from '@auth/sveltekit/client';

	let { children } = $props();

	const availableLanguages = ['en', 'pl'];
	let currentLocale = $derived(getLocale());

	function switchLocale(locale) {
		if (availableLanguages.includes(locale)) {
			setLocale(locale);
		} else {
			console.error('Selected locale not available.');
		}
	}
</script>

<div id="navbar">
	<div id="navbarLeft">
		<button id="appName" onclick={() => goto('/')}>ChatApp</button>
	</div>
	<div id="navbarRight">
		<!-- if user is logged in -->
		{#if $page.data?.session?.user}
			<button class="btn btn-secondary btn-sm" onclick={() => signOut('keycloak')}>
				{m.logout()}
			</button>
		{/if}

		<ThemeToggle />

		<div id="langButtons">
			{#each availableLanguages as language (language)}
				<button onclick={() => switchLocale(language)} class="btn btn-sm {currentLocale === language ? 'btn-active btn-success' : ''}">
					{language}
				</button>
			{/each}
		</div>
	</div>
</div>

{@render children()}
