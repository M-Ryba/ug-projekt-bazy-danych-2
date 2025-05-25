<script>
	import { m } from '$lib/paraglide/messages';
	import { SignIn } from '@auth/sveltekit/components';
</script>

<h1>{m.greeting()}</h1>

<SignIn provider="keycloak">
	<button class="btn">{m.login()}</button>
</SignIn>
