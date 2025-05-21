<script>
	import { m } from '$lib/paraglide/messages';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	const showRegisterRedirectTip = $page.url.searchParams.get('registerRedirect') === 'true';
	let email = $page.url.searchParams.get('email') || ''; // initial value from URL
</script>

<h1>{m.welcome_back()}</h1>

<div class="authForm">
	<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
		<legend class="fieldset-legend">Login</legend>

		<label class="label" for="email">Email</label>
		<input id="email" class="input validator" type="email" required placeholder="joe@example.com" bind:value={email} />
		<div class="validator-hint">Enter valid email address</div>

		<label class="label" for="password">{m.password()}</label>
		<input id="password" type="password" class="input" placeholder={m.password()} />

		<button class="btn btn-neutral mt-4" onclick={() => goto('/chat')}>{m.login()}</button>
	</fieldset>

	<div class="textAndButton">
		<span>{m.noAccountYet()}</span>
		<button class="btn btn-secondary ml-2" onclick={() => goto('/register')}>{m.register()}</button>
	</div>
	<div class="textAndButton">
		<span>{m.forgotPassword()}</span>
		<button class="btn btn-warning ml-2" onclick={() => goto('/reset')}>{m.reset_password()}</button>
	</div>
</div>

{#if showRegisterRedirectTip}
	<div role="alert" class="alert alert-success">
		<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
		<span>{m.registerRedirectTip()}</span>
	</div>
{/if}
