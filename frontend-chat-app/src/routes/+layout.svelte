<script>
	import '../app.css';
	import { setLocale, getLocale } from '$lib/paraglide/runtime';
	import { goto } from '$app/navigation';

	let { children } = $props();

	const availableLanguages = ['en', 'pl'];
	let currentLocale = $derived(getLocale());

	let loggedIn = false; // Placeholder

	function switchLocale(locale) {
		if (availableLanguages.includes(locale)) {
			setLocale(locale);
		} else {
			console.error('Selected locale not available.');
		}
	}

	function logout() {
		// TODO: Logout logic
		console.log('Logging out...');
		goto('/');
	}
</script>

<div id="navbar">
	<div id="navbarLeft">
		<button id="appName" onclick={() => goto('/')}>ChatApp</button>
	</div>
	<div id="navbarRight">
		{#if loggedIn}
			<button onclick={() => logout()}>Logout</button>
			<span class="divider">|</span>
		{/if}

		<div id="langButtons">
			{#each availableLanguages as language (language)}
				<button
					onclick={() => switchLocale(language)}
					class:activeLocaleButton={currentLocale === language}>{language}</button
				>
			{/each}
		</div>
	</div>
</div>

{@render children()}
