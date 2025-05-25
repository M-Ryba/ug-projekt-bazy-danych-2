<script>
	import { m } from '$lib/paraglide/messages';
	import { signIn } from '@auth/sveltekit/client';
</script>

<h1 class="mt-10 mb-8">{m.greeting()}</h1>

<button class="btn btn-xl btn-primary" onclick={() => signIn('keycloak')}>
	{m.login()}
</button>
