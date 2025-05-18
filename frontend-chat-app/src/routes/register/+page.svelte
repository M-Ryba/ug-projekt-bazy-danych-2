<script>
	import { m } from '$lib/paraglide/messages';
	import { goto } from '$app/navigation';
</script>

<h1>{m.greeting()}</h1>

<div class="registerForm">
	<input type="text" name="nickname" id="nickname" placeholder={m.nickname()} />
	<input type="email" name="email" id="email" placeholder="Email" />
	<input type="password" name="password" id="password" placeholder={m.password()} />
	<button
		class="normalButton"
		onclick={() => {
			const email = document.getElementById('email').value;
			goto(`/login?registerRedirect=true&email=${encodeURIComponent(email)}`);
		}}>{m.register()}</button
	>
</div>
<div>
	<span>{m.already_have_account()}</span>
	<button class="normalButton" onclick={() => goto('/login')}>{m.login()}</button>
</div>
