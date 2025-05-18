<script>
	import { m } from '$lib/paraglide/messages';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	const showRegisterRedirectTip = $page.url.searchParams.get('registerRedirect') === 'true';
	const email = $page.url.searchParams.get('email') || '';
</script>

<h1>{m.welcome_back()}</h1>

<div class="loginForm">
	<input type="email" name="email" id="email" placeholder="Email" value={email} />
	<input type="password" name="password" id="password" placeholder={m.password()} />
	<button class="normalButton" onclick={() => goto('/chat')}>{m.login()}</button>
</div>
<div class="mb-2">
	<span>{m.noAccountYet()}</span>
	<button class="normalButton" onclick={() => goto('/register')}>{m.register()}</button>
</div>
<div>
	<span>{m.forgotPassword()}</span>
	<button class="normalButton" onclick={() => goto('/reset')}>{m.reset_password()}</button>
</div>

{#if showRegisterRedirectTip}
	<div class="tip">
		<p>{m.registerRedirectTip()}</p>
	</div>
{/if}
